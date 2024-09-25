"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
const Faber_1 = __importDefault(require("./Faber"));
const core_1 = require("@aries-framework/core");
const utils_1 = require("../controllers/utils");
class Listener {
    proofAcceptListener(timeout = 15000) {
        return new Promise((resolve, reject) => {
            Faber_1.default.agent.events.on(core_1.ProofEventTypes.ProofStateChanged, (_a) => __awaiter(this, [_a], void 0, function* ({ payload }) {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Operation timed out'));
                }, timeout);
                try {
                    if (payload.proofRecord.state === core_1.ProofState.Done) {
                        clearTimeout(timeout);
                        const proofRecordId = payload.proofRecord.id;
                        const encryptedMessage = yield Faber_1.default.agent.proofs.findPresentationMessage(proofRecordId);
                        const presentation = JSON.parse((0, utils_1.decodeBase64)(encryptedMessage === null || encryptedMessage === void 0 ? void 0 : encryptedMessage.presentationAttachments[0].data.base64));
                        resolve(presentation["requested_proof"]["revealed_attrs"]);
                    }
                }
                catch (error) {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            }));
        });
    }
    messageListener() {
        Faber_1.default.agent.events.on(core_1.BasicMessageEventTypes.BasicMessageStateChanged, (event) => __awaiter(this, void 0, void 0, function* () {
            if (event.payload.basicMessageRecord.role === core_1.BasicMessageRole.Receiver) {
                console.log(`\n received a message: ${event.payload.message.content}\n`);
            }
        }));
    }
}
exports.Listener = Listener;
