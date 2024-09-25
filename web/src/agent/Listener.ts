
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
  
  public proofAcceptListener(timeout: number = 60000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('Operation timed out');
        // 타임아웃 에러 발생 시 무시하도록 로그만 출력하거나 별도로 처리 가능
        reject(new Error('Operation timed out'));
      }, timeout);

      faber.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
        try {
          if (payload.proofRecord.state === ProofState.Done) {
            clearTimeout(timeoutId); // 올바른 타이머 ID 사용
            const proofRecordId = payload.proofRecord.id;
            const encryptedMessage = await faber.agent.proofs.findPresentationMessage(proofRecordId);
            const presentation = JSON.parse(decodeBase64(encryptedMessage?.presentationAttachments[0].data.base64));
            resolve(presentation["requested_proof"]["revealed_attrs"]);
          }
        } catch (error) {
          clearTimeout(timeoutId); // 타이머 해제
          console.error('Error processing proof:', error); // 에러 로그 기록
          reject(error); // 에러 처리
        }
      });
    }).catch((error) => {
      // 에러를 무시하거나 로그로만 처리하여 서버 충돌 방지
      console.error('Promise rejection caught:', error.message);
      return null; // 에러 발생 시 null을 반환하거나 대체 값을 처리할 수 있음
    });
  }
 public async messageListener() : Promise<any> {
  return new Promise((resolve,reject)=>{
    faber.agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      if (event.payload.basicMessageRecord.role === BasicMessageRole.Receiver) {
        console.log(`\n received a message: ${event.payload.message.content}\n`)
        // didauth를 위한 서명된 message와 did수신 / 투표값 수신
        try{
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
