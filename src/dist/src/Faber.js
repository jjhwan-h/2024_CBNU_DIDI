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
exports.RegistryOptions = void 0;
const core_1 = require("@aries-framework/core");
const OutputClass_1 = require("./OutputClass");
const BaseAgent_1 = require("./BaseAgent");
const askar_1 = require("@aries-framework/askar");
const dotenv_1 = __importDefault(require("dotenv"));
const Listener_ts_1 = require("./Listener.ts");
dotenv_1.default.config();
class CustomRecord extends core_1.BaseRecord {
    getTags() {
        return {};
    }
}
var RegistryOptions;
(function (RegistryOptions) {
    RegistryOptions["indy"] = "did:indy";
})(RegistryOptions || (exports.RegistryOptions = RegistryOptions = {}));
class Faber extends BaseAgent_1.BaseAgent {
    constructor(port, name) {
        super(port, name);
        this.askarStorage = new askar_1.AskarStorageService;
        this.listener = new Listener_ts_1.Listener();
        this.buildFaber();
    }
    buildFaber() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeAgent();
            const record = yield this.getDids();
            if (record.length === 0)
                yield this.importDid();
            else {
                this.anonCredsIssuerId = record[0]["did"];
                console.log(this.anonCredsIssuerId);
            }
            const schemaRecord = yield this.getById(CustomRecord, "user-schema");
            if (!schemaRecord) {
                const schema = yield this.registerSchema();
                this.saveItems("user-schema", schema);
            }
            const vcCount = yield this.getById(CustomRecord, "vc-count");
            if (!vcCount) {
                this.saveItems('vc-count', { key: 0 });
            }
        });
    }
    save(record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.askarStorage.save(this.agent.context, record);
        });
    }
    saveItems(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = new CustomRecord;
            record.id = id;
            for (const [key, val] of Object.entries(item)) {
                record.metadata.set(key, [val]);
            }
            this.save(record);
        });
    }
    updateItem(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = new CustomRecord;
            record.id = id;
            const key = Object.keys(item)[0];
            record.metadata.set(key, [item[key]]);
            this.update(record);
        });
    }
    update(record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.askarStorage.update(this.agent.context, record);
        });
    }
    getById(recordClass, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new askar_1.AskarStorageService;
            let record;
            try {
                record = yield storage.getById(this.agent.context, recordClass, id);
            }
            catch (_a) {
                record = null;
            }
            return record;
        });
    }
    getDids() {
        return __awaiter(this, void 0, void 0, function* () {
            //await this.agent.wallet.open(this.config.walletConfig as WalletConfig)
            const record = yield this.agent.dids.getCreatedDids({ method: "indy" }); // indy did record를 getCreatedDids 전부
            return record;
        });
    }
    getConnectionRecord() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.outOfBandId) {
                throw Error((0, OutputClass_1.redText)(OutputClass_1.Output.MissingConnectionRecord));
            }
            const [connection] = yield this.agent.connections.findAllByOutOfBandId(this.outOfBandId);
            if (!connection) {
                throw Error((0, OutputClass_1.redText)(OutputClass_1.Output.MissingConnectionRecord));
            }
            return connection;
        });
    }
    waitForConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.outOfBandId) {
                throw new Error((0, OutputClass_1.redText)(OutputClass_1.Output.MissingConnectionRecord));
            }
            const getConnectionRecord = (outOfBandId) => new Promise((resolve, reject) => {
                // Timeout of 20000 seconds
                const timeoutId = setTimeout(() => reject(new Error((0, OutputClass_1.redText)(OutputClass_1.Output.MissingConnectionRecord))), 200000);
                // Start listener
                this.agent.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, (e) => {
                    //console.log(e)
                    if (e.payload.connectionRecord.outOfBandId !== outOfBandId)
                        return;
                    clearTimeout(timeoutId);
                    resolve(e.payload.connectionRecord);
                });
                // Also retrieve the connection record by invitation if the event has already fired
                void this.agent.connections.findAllByOutOfBandId(outOfBandId).then(([connectionRecord]) => {
                    if (connectionRecord) {
                        clearTimeout(timeoutId);
                        resolve(connectionRecord);
                    }
                });
            });
            const connectionRecord = yield getConnectionRecord(this.outOfBandId);
            try {
                yield this.agent.connections.returnWhenIsConnected(connectionRecord.id, { timeoutMs: 2000000 });
            }
            catch (e) {
                console.log((0, OutputClass_1.redText)(`\nTimeout of 20000 seconds reached.. Returning to home screen.\n`));
                return;
            }
            console.log((0, OutputClass_1.greenText)(OutputClass_1.Output.ConnectionEstablished));
        });
    }
    printConnectionInvite() {
        return __awaiter(this, void 0, void 0, function* () {
            const outOfBand = yield this.agent.oob.createInvitation();
            this.outOfBandId = outOfBand.id;
            return outOfBand.outOfBandInvitation.toUrl({ domain: `${process.env.AGENT_URL}` });
        });
    }
    setupConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.printConnectionInvite();
            yield this.waitForConnection();
            faber.listener.proofAcceptListener();
        });
    }
    printSchema(name, version, attributes) {
        console.log(`\n\nThe credential definition will look like this:\n`);
        console.log((0, OutputClass_1.purpleText)(`Name: ${OutputClass_1.Color.Reset}${name}`));
        console.log((0, OutputClass_1.purpleText)(`Version: ${OutputClass_1.Color.Reset}${version}`));
        console.log((0, OutputClass_1.purpleText)(`Attributes: ${OutputClass_1.Color.Reset}${attributes[0]}, ${attributes[1]}\n`));
    }
    registerSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.anonCredsIssuerId) {
                throw new Error((0, OutputClass_1.redText)('Missing anoncreds issuerId'));
            }
            const schemaTemplate = {
                name: 'DIDI' + core_1.utils.uuid(),
                version: '1.0.0',
                attrNames: ['VC', 'room'],
                issuerId: this.anonCredsIssuerId,
            };
            this.printSchema(schemaTemplate.name, schemaTemplate.version, schemaTemplate.attrNames);
            const { schemaState } = yield this.agent.modules.anoncreds.registerSchema({
                schema: schemaTemplate,
                options: {
                    endorserMode: 'internal',
                    endorserDid: process.env.BCOVRINENDORSERDID
                },
            });
            if (schemaState.state !== 'finished') {
                throw new Error(`Error registering schema: ${schemaState.state === 'failed' ? schemaState.reason : 'Not Finished'}`);
            }
            return schemaState;
        });
    }
    registerCredentialDefinition(schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.anonCredsIssuerId) {
                throw new Error((0, OutputClass_1.redText)('Missing anoncreds issuerId'));
            }
            const vcCount = yield this.getById(CustomRecord, "vc-count").then((el) => { return el === null || el === void 0 ? void 0 : el.metadata.data; });
            ;
            const { credentialDefinitionState } = yield this.agent.modules.anoncreds.registerCredentialDefinition({
                credentialDefinition: {
                    schemaId,
                    issuerId: this.anonCredsIssuerId,
                    tag: String(vcCount === null || vcCount === void 0 ? void 0 : vcCount.key[0]),
                },
                options: {
                    //supportRevocation: false,
                    endorserMode: 'internal',
                    endorserDid: process.env.BCOVRINENDORSERDID
                },
            });
            const nCount = (vcCount === null || vcCount === void 0 ? void 0 : vcCount.key[0]) + 1;
            yield this.updateItem('vc-count', { key: nCount });
            if (credentialDefinitionState.state !== 'finished') {
                throw new Error(`Error registering credential definition: ${credentialDefinitionState.state === 'failed' ? credentialDefinitionState.reason : 'Not Finished'}}`);
            }
            this.credentialDefinition = credentialDefinitionState;
            return this.credentialDefinition;
        });
    }
    issueCredential(credentailInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vc, room } = credentailInfo;
            const schema = yield this.getById(CustomRecord, 'user-schema').then((el) => { return el === null || el === void 0 ? void 0 : el.metadata.data; });
            if (schema) {
                const credentialDefinition = yield this.registerCredentialDefinition(schema.schemaId[0]);
                const connectionRecord = yield this.getConnectionRecord();
                yield this.agent.credentials.offerCredential({
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
                });
            }
            else {
                console.log("UserSchema is not exist");
            }
        });
    }
    logInProofAttribute() {
        return __awaiter(this, void 0, void 0, function* () {
            //const schema=await this.getById(CustomRecord,'user-schema').then((el)=>{return el?.metadata.data});
            const proofAttribute = {
                vc: {
                    name: 'vc',
                    restrictions: [
                        {
                            //schema_id:schema?.schemaId[0],
                            //schema_issuer_id:this.anonCredsIssuerId,
                            issuer_id: this.anonCredsIssuerId,
                            //cred_def_id: this.credentialDefinition?.credentialDefinitionId,
                        },
                    ],
                },
                room: {
                    name: 'room',
                    restrictions: [
                        {
                            issuer_id: this.anonCredsIssuerId,
                        },
                    ],
                }
            };
            return proofAttribute;
        });
    }
    sendProofRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionRecord = yield this.getConnectionRecord();
            const proofAttribute = yield this.logInProofAttribute();
            const res = yield this.agent.proofs.requestProof({
                protocolVersion: 'v2',
                connectionId: connectionRecord.id,
                proofFormats: {
                    anoncreds: {
                        name: 'proof-request',
                        version: '1.0',
                        requested_attributes: proofAttribute,
                    },
                },
            });
            return res;
        });
    }
    sendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionRecord = yield this.getConnectionRecord();
            yield this.agent.basicMessages.sendMessage(connectionRecord.id, message);
        });
    }
}
;
const faber = new Faber(process.env.AGENT_PORT, process.env.NAME);
exports.default = faber;
