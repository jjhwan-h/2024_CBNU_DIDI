import type { RegisterCredentialDefinitionReturnStateFinished } from '@aries-framework/anoncreds'
import type { ConnectionRecord, ConnectionStateChangedEvent,  BaseRecordConstructor, TagsBase} from '@aries-framework/core'
import type { IndyVdrRegisterSchemaOptions, IndyVdrRegisterCredentialDefinitionOptions } from '@aries-framework/indy-vdr'
import { ConnectionEventTypes, utils,BaseRecord} from '@aries-framework/core'
import { Color, Output, greenText, purpleText, redText } from './OutputClass'
import { BaseAgent} from './BaseAgent'
import { IVoteIssueCredentialInfo,IDidIssueCredentialInfo } from './interfaces/IIssueCredentialInfo'
import {IItemObject} from './interfaces/IItemObject.ts'
import {AskarStorageService} from '@aries-framework/askar'
import dotenv from 'dotenv';
import { Listener } from './Listener.ts'

dotenv.config();

class CustomRecord extends BaseRecord{
  public getTags(): TagsBase{
    return {}
  }
}

export enum RegistryOptions {
  indy = 'did:indy',
}

class Faber extends BaseAgent {
  public outOfBandId?: string
  public credentialDefinition?: RegisterCredentialDefinitionReturnStateFinished
  public askarStorage:AskarStorageService<CustomRecord>
  public listener:Listener

  public constructor(port: number, name: string) {
    super(port, name)
    this.askarStorage= new AskarStorageService;
    this.listener= new Listener();
    this.buildFaber();
  }

  public async buildFaber(){
    await this.initializeAgent();
    const record = await this.getDids();
    // const connect = await this.agent.connections.getAll();
    // console.log(connect);
    if(record.length===0) await this.importDid();
    else{
      this.anonCredsIssuerId=record[0]["did"];
      console.log(this.anonCredsIssuerId);
    }
    let schemaRecord = await this.getById(CustomRecord,"vote-schema");
    if(!schemaRecord){
      const schema = await this.registerVoteSchema();
      this.saveItems("vote-schema",schema);
    }
    schemaRecord = await this.getById(CustomRecord,"did-schema");
    if(!schemaRecord){
      const schema = await this.registerDidSchema();
      this.saveItems("did-schema",schema);
    }
    const vcCount = await this.getById(CustomRecord,"vc-count");
    if(!vcCount){
      this.saveItems('vc-count',{key:0});
    }
  }

  private async save(record:BaseRecord){
    await this.askarStorage.save(this.agent.context,record);
  }
  private async saveItems(id:string,item:IItemObject){
    const record:BaseRecord = new CustomRecord
    record.id= id;
    for(const [key,val] of Object.entries(item)){
      record.metadata.set(key,[val])
    }
    this.save(record);
  }
  private async updateItem(id:string,item:IItemObject){
    const record:BaseRecord = new CustomRecord
    record.id=id;
    const key=Object.keys(item)[0];

    record.metadata.set(key,[item[key]]);
    this.update(record);
  }
  private async update(record:BaseRecord){
    await this.askarStorage.update(this.agent.context,record);
  }
  
  private async getById(recordClass:BaseRecordConstructor<CustomRecord>, id:string):Promise<BaseRecord<TagsBase,TagsBase,{}>  | null>{
    const storage = new AskarStorageService;
    let record;
    try{
      record = await storage.getById(this.agent.context,recordClass,id);
    }catch{
      record=null
    }
    return record
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

  
  private async waitForConnection() {
    if (!this.outOfBandId) {
      throw new Error(redText(Output.MissingConnectionRecord))
    }

    console.log('Waiting for Alice to finish connection...')

    const getConnectionRecord = (outOfBandId: string) =>
      new Promise<ConnectionRecord>((resolve, reject) => {
        try{
            // Timeout of  200000 seconds
            const timeoutId = setTimeout(() => {
              try {
                reject(new Error(redText(Output.MissingConnectionRecord)));
              } catch (error:any) {
                console.error('Timeout error occurred: ', error.message);
              }
            }, 200000);

          // Start listener
          this.agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, (e) => {
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
        }catch(error:any){
          console.error('An error occurred: ',error.message)
        }
        
      })

    const connectionRecord = await getConnectionRecord(this.outOfBandId)

    try {
      await this.agent.connections.returnWhenIsConnected(connectionRecord.id)
    } catch (e) {
      console.log(redText(`\nTimeout of 20 seconds reached.. Returning to home screen.\n`))
      return
    }
    console.log(greenText(Output.ConnectionEstablished))
  }
    
    public async printConnectionInvite() {
      const outOfBand = await this.agent.oob.createInvitation()
      this.outOfBandId = outOfBand.id
      
      return outOfBand.outOfBandInvitation.toUrl({ domain: `${process.env.AGENT_URL}` }) 
    }
  public async setupConnection() {
    // await this.printConnectionInvite();
    await this.waitForConnection();
  }

  private printSchema(name: string, version: string, attributes: string[]) {
    console.log(`\n\nThe credential definition will look like this:\n`)
    console.log(purpleText(`Name: ${Color.Reset}${name}`))
    console.log(purpleText(`Version: ${Color.Reset}${version}`))
    console.log(purpleText(`Attributes: ${Color.Reset}${attributes[0]}, ${attributes[1]}\n`))
  }

  private async registerVoteSchema() {
    if (!this.anonCredsIssuerId) {
      throw new Error(redText('Missing anoncreds issuerId'))
    }
    const schemaTemplate = {
      name: 'DIDI' + utils.uuid(),
      version: '1.0.0',
      attrNames: ['vc', 'room'],
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

  private async registerDidSchema() {
    if (!this.anonCredsIssuerId) {
      throw new Error(redText('Missing anoncreds issuerId'))
    }
    const schemaTemplate = {
      name: 'DIDI' + utils.uuid(),
      version: '1.0.0',
      attrNames: ['did'],
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

    const vcCount = await this.getById(CustomRecord,"vc-count").then((el)=>{return el?.metadata.data});;
    
    const { credentialDefinitionState } =
      await this.agent.modules.anoncreds.registerCredentialDefinition<IndyVdrRegisterCredentialDefinitionOptions>({
        credentialDefinition: {
          schemaId,
          issuerId: this.anonCredsIssuerId,
          tag: String(vcCount?.key[0]),
        },
        options: {
          //supportRevocation: false,
          endorserMode: 'internal',
          endorserDid: process.env.BCOVRINENDORSERDID as string
        },
      })

      const nCount = vcCount?.key[0]+1;
      await this.updateItem('vc-count',{key:nCount});
    
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

  public async issueVoteCredential(credentailInfo:IVoteIssueCredentialInfo) {
    const {vc,room} = credentailInfo;
    const schema = await this.getById(CustomRecord,'vote-schema').then((el)=>{return el?.metadata.data});
    try{
      if(schema){
        const credentialDefinition = await this.registerCredentialDefinition(schema.schemaId[0]);
        const connectionRecord = await this.getConnectionRecord();
      
        await this.agent.credentials.offerCredential({
        connectionId: connectionRecord.id,
        protocolVersion: 'v2',
        credentialFormats: {
          anoncreds: { 
            attributes: [
              {
                name: 'vc',
                value: vc,
              },
              {
                name: 'room',
                value: room,
              },
            ],
            credentialDefinitionId: credentialDefinition.credentialDefinitionId,
          },
        },
      })
      }else{
        console.log("UserSchema is not exist");
      }  
    }catch(error){
      console.error(error)
    }
  }
    

  public async issueDidCredential(credentailInfo:IDidIssueCredentialInfo) {
    const {did} = credentailInfo;
    const schema = await this.getById(CustomRecord,'did-schema').then((el)=>{return el?.metadata.data});
    try{
      if(schema){
        const credentialDefinition = await this.registerCredentialDefinition(schema.schemaId[0]);
        const connectionRecord = await this.getConnectionRecord();
      
        await this.agent.credentials.offerCredential({
        connectionId: connectionRecord.id,
        protocolVersion: 'v2',
        credentialFormats: {
          anoncreds: { 
            attributes: [
              {
                name: 'did',
                value: did,
              }
            ],
            credentialDefinitionId: credentialDefinition.credentialDefinitionId,
          },
        },
      })
      }else{
        console.log("UserSchema is not exist");
      }  
    }catch(error:any){
      console.error("An error occured: ",error.message)
    }
  }

  private async voteProofAttribute() {
    //const schema=await this.getById(CustomRecord,'vote-schema').then((el)=>{return el?.metadata.data});
    const proofAttribute = {
      vc: {
        name:'vc',
        restrictions: [
          {
            //schema_id:schema?.schemaId[0],
            //schema_issuer_id:this.anonCredsIssuerId,
            issuer_id: this.anonCredsIssuerId,
            cred_def_id: this.credentialDefinition?.credentialDefinitionId,
          },
        ],
      },
      room: {
        name:'room',
        restrictions: [
          {
            issuer_id: this.anonCredsIssuerId,
          },
        ],
      }
    }

    return proofAttribute
  }

  public async sendProofRequest() {
    const connectionRecord = await this.getConnectionRecord();
    const proofAttribute = await this.voteProofAttribute();

    const res = await this.agent.proofs.requestProof({
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
    return res;
  }

  public async sendMessage(message: string) {
    const connectionRecord = await this.getConnectionRecord();
    await this.agent.basicMessages.sendMessage(connectionRecord.id, message);
  }

};

const faber = new Faber(process.env.AGENT_PORT as unknown as number, process.env.NAME as string);
export default faber