import type { RegisterCredentialDefinitionReturnStateFinished } from '@aries-framework/anoncreds'
import type { ConnectionRecord, ConnectionStateChangedEvent} from '@aries-framework/core'
import type { IndyVdrRegisterSchemaOptions, IndyVdrRegisterCredentialDefinitionOptions } from '@aries-framework/indy-vdr'
import { ConnectionEventTypes, utils } from '@aries-framework/core'
import { Color, Output, greenText, purpleText, redText } from './OutputClass'
import { BaseAgent} from './BaseAgent'
import { IIssueCredentialInfo } from './interfaces/IIssueCredentialInfo'
import dotenv from 'dotenv';

dotenv.config();

export enum RegistryOptions {
  indy = 'did:indy',
}


class Faber extends BaseAgent {
  public outOfBandId?: string
  public credentialDefinition?: RegisterCredentialDefinitionReturnStateFinished

  public constructor(port: number, name: string) {
    super(port, name)
    this.buildFaber();
    console.log("Faber Construct");
  }

  public async buildFaber(){
    await this.initializeAgent();
    const record = await this.getDids();
    console.log(record)
    if(record.length===0) await this.importDid();
    else{
      this.anonCredsIssuerId=record[0]["did"];
      console.log(this.anonCredsIssuerId);
    }
  }

  public async getDids(){
    //await this.agent.wallet.open(this.config.walletConfig as WalletConfig)
    const record = await this.agent.dids.getCreatedDids({method:"indy"}); // indy did record를 getCreatedDids 전부
    return record;
  }
  private async getConnectionRecord() {
    if (!this.outOfBandId) {
      throw Error(redText(Output.MissingConnectionRecord))
    }

    const [connection] = await this.agent.connections.findAllByOutOfBandId(this.outOfBandId)

    if (!connection) {
      throw Error(redText(Output.MissingConnectionRecord))
    }

    return connection
  }

  private async printConnectionInvite() {
    const outOfBand = await this.agent.oob.createInvitation()
    this.outOfBandId = outOfBand.id
    //console.log(outOfBand)
    console.log(
      outOfBand.outOfBandInvitation.toUrl({ domain: `${process.env.URL}` }), 
    )
  }

  private async waitForConnection() {
    if (!this.outOfBandId) {
      throw new Error(redText(Output.MissingConnectionRecord))
    }

    const getConnectionRecord = (outOfBandId: string) =>
      new Promise<ConnectionRecord>((resolve, reject) => {
        // Timeout of 20000 seconds
        const timeoutId = setTimeout(() => reject(new Error(redText(Output.MissingConnectionRecord))), 2000000)

        // Start listener
        this.agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, (e) => {
          //console.log(e)
          if (e.payload.connectionRecord.outOfBandId !== outOfBandId) return

          clearTimeout(timeoutId)
          resolve(e.payload.connectionRecord)
        })

        // Also retrieve the connection record by invitation if the event has already fired
        void this.agent.connections.findAllByOutOfBandId(outOfBandId).then(([connectionRecord]) => {
          if (connectionRecord) {
            clearTimeout(timeoutId)
            resolve(connectionRecord)
          }
        })
      })

    const connectionRecord = await getConnectionRecord(this.outOfBandId)
    //console.log(`connectionRecord : ${JSON.stringify(connectionRecord)}`)
    try {
      await this.agent.connections.returnWhenIsConnected(connectionRecord.id,{timeoutMs:2000000});
    } catch (e) {
      console.log(redText(`\nTimeout of 20000 seconds reached.. Returning to home screen.\n`))
      return
    }
    console.log(greenText(Output.ConnectionEstablished))
  }

  public async setupConnection() {
    await this.printConnectionInvite()
    await this.waitForConnection()
  }

  private printSchema(name: string, version: string, attributes: string[]) {
    console.log(`\n\nThe credential definition will look like this:\n`)
    console.log(purpleText(`Name: ${Color.Reset}${name}`))
    console.log(purpleText(`Version: ${Color.Reset}${version}`))
    console.log(purpleText(`Attributes: ${Color.Reset}${attributes[0]}, ${attributes[1]}, ${attributes[2]}\n`))
  }

  private async registerSchema() {
    if (!this.anonCredsIssuerId) {
      throw new Error(redText('Missing anoncreds issuerId'))
    }
    const schemaTemplate = {
      name: 'DIDI' + utils.uuid(),
      version: '1.0.0',
      attrNames: ['name', 'wallet', 'email'],
      issuerId: this.anonCredsIssuerId,
    }
    this.printSchema(schemaTemplate.name, schemaTemplate.version, schemaTemplate.attrNames)


    const { schemaState } = await this.agent.modules.anoncreds.registerSchema<IndyVdrRegisterSchemaOptions>({
      schema: schemaTemplate,
      options: {
        endorserMode: 'internal',
        endorserDid: process.env.BCOVRINENDORSERDID as string
      },
    })

    if (schemaState.state !== 'finished') {
      throw new Error(
        `Error registering schema: ${schemaState.state === 'failed' ? schemaState.reason : 'Not Finished'}`
      )
    }
    return schemaState
  }

  private async registerCredentialDefinition(schemaId: string) {
    if (!this.anonCredsIssuerId) {
      throw new Error(redText('Missing anoncreds issuerId'))
    }

    const { credentialDefinitionState } =
      await this.agent.modules.anoncreds.registerCredentialDefinition<IndyVdrRegisterCredentialDefinitionOptions>({
        credentialDefinition: {
          schemaId,
          issuerId: this.anonCredsIssuerId,
          tag: 'latest',
        },
        options: {
          //supportRevocation: false,
          endorserMode: 'internal',
          endorserDid: process.env.BCOVRINENDORSERDID as string
        },
      })

    if (credentialDefinitionState.state !== 'finished') {
      throw new Error(
        `Error registering credential definition: ${
          credentialDefinitionState.state === 'failed' ? credentialDefinitionState.reason : 'Not Finished'
        }}`
      )
    }

    this.credentialDefinition = credentialDefinitionState
    return this.credentialDefinition
  }

  public async issueCredential(credentailInfo:IIssueCredentialInfo) {
    console.log(credentailInfo);
    const {email,name,wallet} = credentailInfo;
    const schema = await this.registerSchema()
    const credentialDefinition = await this.registerCredentialDefinition(schema.schemaId)
    const connectionRecord = await this.getConnectionRecord()
    
    await this.agent.credentials.offerCredential({
      connectionId: connectionRecord.id,
      protocolVersion: 'v2',
      credentialFormats: {
        anoncreds: {
          attributes: [
            {
              name: 'name',
              value: name,
            },
            {
              name: 'wallet',
              value: wallet,
            },
            {
              name: 'email',
              value: email,
            },
          ],
          credentialDefinitionId: credentialDefinition.credentialDefinitionId,
        },
      },
    })
  }


  private async newProofAttribute() {
    const proofAttribute = {
      name: {
        name: 'name',
        restrictions: [
          {
            cred_def_id: this.credentialDefinition?.credentialDefinitionId,
          },
        ],
      },
    }

    return proofAttribute
  }

  public async sendProofRequest() {
    const connectionRecord = await this.getConnectionRecord()
    const proofAttribute = await this.newProofAttribute()

    await this.agent.proofs.requestProof({
      protocolVersion: 'v2',
      connectionId: connectionRecord.id,
      proofFormats: {
        anoncreds: {
          name: 'proof-request',
          version: '1.0',
          requested_attributes: proofAttribute,
        },
      },
    })
  }

  public async sendMessage(message: string) {
    const connectionRecord = await this.getConnectionRecord()
    await this.agent.basicMessages.sendMessage(connectionRecord.id, message)
  }

};



const faber = new Faber(process.env.AGENT_PORT as unknown as number, process.env.NAME as string)
export default faber