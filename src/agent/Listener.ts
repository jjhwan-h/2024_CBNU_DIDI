
import faber from "./Faber";
import type {
  BasicMessageStateChangedEvent,
  CredentialExchangeRecord,
  CredentialStateChangedEvent,
  ProofExchangeRecord,
  ProofStateChangedEvent,
} from '@aries-framework/core'
import {
  BasicMessageEventTypes,
  BasicMessageRole,
  CredentialEventTypes,
  CredentialState,
  ProofEventTypes,
  ProofState,
} from '@aries-framework/core'
import { decodeBase64 } from "../controllers/utils";
import { EventEmitter } from "stream";

export class Listener{
  
  public proofAcceptListener(timeout:number=15000) : Promise<any>{
    return new Promise((resolve,reject)=>{
        faber.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Operation timed out'));
          }, timeout);

          try{
            if (payload.proofRecord.state === ProofState.Done) {
              clearTimeout(timeout)
              const proofRecordId = payload.proofRecord.id;
              const encryptedMessage = await faber.agent.proofs.findPresentationMessage(proofRecordId);
              const presentation = JSON.parse(decodeBase64(encryptedMessage?.presentationAttachments[0].data.base64));
              resolve(presentation["requested_proof"]["revealed_attrs"]);
            }
          }catch(error){
            clearTimeout(timeoutId)
            reject(error);
          }
      });
    });
  }

 public async messageListener() : Promise<any> {
  return new Promise((resolve,reject)=>{
    faber.agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      if (event.payload.basicMessageRecord.role === BasicMessageRole.Receiver) {
        console.log(`\n received a message: ${event.payload.message.content}\n`)
        // didauth를 위한 서명된 message와 did수신
        try{
          console.log(event.payload.basicMessageRecord)
          console.log(event.metadata.contextCorrelationId)
          const jsonObject = JSON.parse(event.payload.message.content);
          resolve(jsonObject)
        }catch (err){
          console.log(err)
        }
      }
    })
  })
  }

}
