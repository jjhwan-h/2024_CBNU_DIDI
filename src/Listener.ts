
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

export class Listener{
  public on: boolean
  public constructor() {
    this.on = false
  }
  public proofAcceptListener(){
    faber.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
      if (payload.proofRecord.state === ProofState.PresentationReceived) {
        this.on=true;
        console.log(payload)
        this.on=false;
      }
      if (payload.proofRecord.state === ProofState.Done) {
        this.on=true;
        console.log(payload)
        this.on=false;
      }
    })
  }

  public messageListener() {
    faber.agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      if (event.payload.basicMessageRecord.role === BasicMessageRole.Receiver) {
        console.log(`\n received a message: ${event.payload.message.content}\n`)
      }
    })
  }

}
