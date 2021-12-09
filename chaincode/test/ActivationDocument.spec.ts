
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/site';
import { ActivationDocument } from '../src/model/activationDocument';
import { SystemOperator } from '../src/systemOperator';
import { ActivationDocumentController } from '../src/controller/ActivationDocumentController';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests ActivationDocument', () => {
    let transactionContext, chaincodeStub;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);
        chaincodeStub.MspiID = 'FakeMspID'

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.getQueryResult.callsFake(async (query) => {
            function* internalGetQueryResult() {
                if (chaincodeStub.states) {
                    const copied = Object.assign({}, chaincodeStub.states);
                    for (let key in copied) {
                        if (copied[key] == 'non-json-value') { 
                            yield {value: copied[key]};
                            continue
                        }
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        // console.log('obJson=', obJson);
                        const objStr: string = obJson.docType;
                        const queryJson = JSON.parse(query);
                        console.log('queryJson=', queryJson);
                        const queryStr = queryJson.selector.docType
                        // console.log('queryStr=', queryStr , 'objStr=', objStr);
                        if (queryStr == objStr) {
                            // if (queryJson.selector.systemOperatorMarketParticipantMrId) {
                                const querySO = queryJson.selector.receiverMarketParticipantMrid;
                                // console.log('querySO=', querySO);
                                const objSO = obJson.receiverMarketParticipantMrid;
                                // console.log('objSO=', objSO);
                                if (querySO == objSO) {
                                    console.log('yield=', querySO, objSO);
                                    yield {value: copied[key]};
                                }
                            // } else if (queryJson.selector.producerMarketParticipantMrid) {
                                // const queryProd = queryJson.selector.producerMarketParticipantMrid;
                                // console.log('queryProd=', queryProd);
                                // const objProd = obJson.producerMarketParticipantMrid;
                                // console.log('objProd=', objProd);
                                // if (queryProd == objProd) {
                                    // console.log('yield=', queryProd, objProd);
                                    // yield {value: copied[key]};
                                // }
                            // } 
                            // else {
                            //     yield {value: copied[key]};
                            // }                           
                        }
                    }
                }
            }
            return Promise.resolve(internalGetQueryResult());
        });


        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });

    describe('Test CreateActivationDocument', () => {
        // it('should return ERROR on CreateActivationDocument', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         await star.CreateActivationDocument(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateActivationDocument(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateActivationDocument missing originAutomataRegisteredResourceMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('originAutomataRegisteredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing registeredResourceMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('registeredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing measurementUnitName', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"registeredResourceMrid\": \"12345678901234\", \"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('measurementUnitName is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing messageType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('messageType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing businessType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('businessType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing orderType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"businessType\": \"string\", \"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('orderType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing orderEnd', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CIVRAY AUT03\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"businessType\": \"string\", \"orderType\": \"string\"}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('orderEnd is required');
            }
        });

        it('should return Error CreateActivationDocument couple HTA wrong MSPID -> FakeMSP', async () => {
            let star = new Star();
            const order = new ActivationDocument('string', 'string', '12345678901234', 'KW', 'string', 'string', 'string', false);

            chaincodeStub.MspiID = 'FakeMSP';
            // await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for Activation Document');
            }
        });

        it('should return Error CreateActivationDocument couple HTA wrong MSPID -> RTE', async () => {
            let star = new Star();
            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2 
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            // await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, RTEMSP does not have write access for KW orders');
            }
        });

        it('should return Error CreateActivationDocument couple HTA wrong unit measure', async () => {
            let star = new Star();
            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2 
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, ENEDISMSP does not have write access for MW orders');
            }
        });

        it('should return Error CreateActivationDocument couple HTA missing systemoperator', async () => {
            let star = new Star();
            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.createSystemOperator(transactionContext, '17V000000992746D', 'ENEDIS', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('System Operator : 17V000000992746D does not exist');
            }
        });

        it('should return Error CreateActivationDocument couple HTA missing producer', async () => {
            let star = new Star();
            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'ENEDIS', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745X does not exist');
            }
        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            let star = new Star();
            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'ENEDIS', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, order ));
        });

        it('should return Error CreateActivationDocument couple HTA missing to much optional fields', async () => {
            let star = new Star();
            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                // orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                // senderMarketParticipantMrid: '17V000000992746D', // FK?
                // receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Order must have a limitation value');
            }
        });

/*
        it('should return SUCCESS CreateActivationDocument HTA', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V0000009927464',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                // marketEvaluationPointMrid: 'CodePPE', // optional 
                // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(site));

            let ret = JSON.parse((await chaincodeStub.getState("PDL00000000289766")).toString());
            expect(ret).to.eql( Object.assign({docType: 'site'}, site ));
        });

        it('should return ERROR CreateActivationDocument HTA wrong MSPID', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V0000009927464',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                // marketEvaluationPointMrid: 'CodePPE', // optional 
                // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(site));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for HTA(MV) sites');
            }
        });

    });
*/

    // describe('Test getActivationDocumentByProducer', () => {
    //     it('should return ERROR on getActivationDocumentByProducer', async () => {
    //         let star = new Star();
    //         chaincodeStub.MspiID = 'RTEMSP';
    //         try {
    //             await star.GetActivationDocumentByProducer(transactionContext, 'toto');
    //         } catch (err) {
    //             // console.info(err.message)
    //             expect(err.message).to.equal('toto does not exist');
    //         }
    //     });

    //     it('should return SUCCESS on getActivationDocumentByProducer', async () => {
    //         let star = new Star();
    //         const order: ActivationDocument = {

    //             activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
    //             originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
    //             registeredResourceMrid: '12345678901234', // FK2
    //             measurementUnitName: 'KW',
    //             messageType: 'string',
    //             businessType: 'string',
    //             orderType: 'string',
    //             orderEnd: false,
    
    //             orderValue: '1',
    //             startCreatedDateTime: 'string',
    //             // testDateTime: 'Date', // Test DELETE ME //////////////////////
    //             endCreatedDateTime: 'string',
    //             revisionNumber: '1',
    //             reasonCode: 'string', // optionnal in case of TVC modulation
    //             senderMarketParticipantMrid: '17V000000992746D', // FK?
    //             receiverMarketParticipantMrid: '17X000001309745X', // FK?
    //             // reconciliation: false,
    //             // subOrderList: [],
    //         }

    //         chaincodeStub.MspiID = 'ENEDISMSP';
    //         await star.createSystemOperator(transactionContext, '17V000000992746D', 'ENEDIS', 'A50');
    //         await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
    //         await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

    //         let test = JSON.parse(await star.GetActivationDocumentByProducer(transactionContext, "17X000001309745X"));
    //         console.log('test=', test);
    //         expect(test).to.eql(Object.assign({docType: 'activationDocument'}, order));
    //         let ret = JSON.parse(await chaincodeStub.getState('8c56459a-794a-4ed1-a7f6-33b0064508f1'));
    //         expect(ret).to.eql(Object.assign({docType: 'activationDocument'}, order));
    //     });
    // });

    describe('Test GetActivationDocumentByProducer', () => {
        it('should return OK on GetActivationDocumentByProducer empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetActivationDocumentByProducer(transactionContext, producer);
            ret = JSON.parse(ret);
            console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on GetActivationDocumentByProducer', async () => {
            let star = new Star();

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927464', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let ret = await star.GetActivationDocumentByProducer(transactionContext, orderA.receiverMarketParticipantMrid);
            ret = JSON.parse(ret);
            console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: ActivationDocument[] = [
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: "string",
                    measurementUnitName: "KW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CIVRAY AUT03",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: true,
                    registeredResourceMrid: "12345678901234",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V0000009927464",
                    startCreatedDateTime: "string",
                }, 
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: "string",
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CIVRAY AUT03",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: true,
                    registeredResourceMrid: "12345678901234",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V000000992746D",
                    startCreatedDateTime: "string",
                }
           ];

            expect(ret).to.eql(expected);
        });

        it('should return success on getSiteBySystemOperator for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927464', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CIVRAY AUT03', // FK1
                registeredResourceMrid: '12345678901234', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: 'string',
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: 'string',
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745Y', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let retB = await star.GetActivationDocumentByProducer(transactionContext, orderB.receiverMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB)
            expect(retB.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: "string",
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CIVRAY AUT03",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745Y",
                    reconciliation: true,
                    registeredResourceMrid: "12345678901234",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V000000992746D",
                    startCreatedDateTime: "string",
                }
           ];

            expect(retB).to.eql(expected);
        });
});
/*
        });

    describe('Test getSiteByProducer', () => {
        it('should return OK on getSiteByProducer empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.getSitesBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSiteByProducer', async () => {
            let star = new Star();

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTB));

            let retA = await star.getSitesByProducer(transactionContext, siteHTA.producerMarketParticipantMrid);
            retA = JSON.parse(retA);
            // console.log('retA=', retA)
            expect(retA.length).to.equal(1);

            const expected: Site[] = [
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289766",
                    producerMarketParticipantMrid: "17X0000013097450",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V0000009927464",
                    technologyType: "Eolien",
                }
           ];

            expect(retA).to.eql(expected);
        });

        it('should return success on getSiteByProducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTB));

            let retB = await star.getSitesByProducer(transactionContext, siteHTB.producerMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB)
            expect(retB.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289767",
                    producerMarketParticipantMrid: "17X0000013097450",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    marketEvaluationPointMrid: "CodePPE",
                    schedulingEntityRegisteredResourceMrid: "CodeEDP",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V000000992746D",
                    technologyType: "Eolien",
                }
           ];

            expect(retB).to.eql(expected);
        });

        it('should return success on getSites for producer', async () => {
            let star = new Star();

            const siteHTAprodA: Site = {
                meteringPointMrid: 'PRM00000000234766',
                systemOperatorMarketParticipantMrid: '17V0000009927468',
                producerMarketParticipantMrid: '17X000001307745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                siteAdminMrid: '489 981 029',
                siteLocation: 'Biscarosse',
                siteIecCode: 'S7X0000013077453',
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4566',
                systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
            }
            const siteHTAprodB: Site = {
                meteringPointMrid: 'PRM00000000234767',
                systemOperatorMarketParticipantMrid: '17V0000009927468',
                producerMarketParticipantMrid: '17X0000013077450',
                technologyType: 'Photovoltaïque',
                siteType: 'Injection',
                siteName: 'Parc photovoltaïque de Melle',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                siteAdminMrid: '490 981 030',
                siteLocation: 'Nantes',
                siteIecCode: 'S7X0000013077454',
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4567',
                systemOperatorEntityFlexibilityDomainName: 'Départ 2',
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927468', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X0000013077450', 'EolienFR vert Cie', 'A21');
            await star.createProducer(transactionContext, '17X000001307745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTAprodA));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTAprodB));
    
            const siteHTBProdA: Site = {
                meteringPointMrid: 'PDL00000000289767', 
                systemOperatorMarketParticipantMrid: '17V0000009927469', 
                producerMarketParticipantMrid: '17X000001307745X', 
                technologyType: 'Eolien', 
                siteType: 'Injection', 
                siteName: 'Ferme éolienne de Genonville', 
                substationMrid: 'GDO A4RTD', 
                substationName: 'CIVRAY', 
                marketEvaluationPointMrid: 'CodePPE', 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', 
                siteAdminMrid: '489 981 029', 
                siteLocation: 'Biscarosse', 
                siteIecCode: 'S7X0000013077478', 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
            }

            const siteHTBProdB: Site = {
                meteringPointMrid: 'PDL00000000289768', 
                systemOperatorMarketParticipantMrid: '17V0000009927469', 
                producerMarketParticipantMrid: '17X0000013077450', 
                technologyType: 'Eolien', 
                siteType: 'Injection', 
                siteName: 'Ferme éolienne de Genonville', 
                substationMrid: 'GDO A4RTD', 
                substationName: 'CIVRAY', 
                marketEvaluationPointMrid: 'CodePPE', 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', 
                siteAdminMrid: '489 981 029', 
                siteLocation: 'Biscarosse', 
                siteIecCode: 'S7X0000013077478', 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927469', 'RTE', 'A49');
            // await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            // await star.createProducer(transactionContext, '17X000001307745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTBProdA));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(siteHTBProdB));

            let retProd = await star.getSitesByProducer(transactionContext, siteHTAprodA.producerMarketParticipantMrid);
            retProd = JSON.parse(retProd);
            console.log('retProd=', retProd)
            expect(retProd.length).to.equal(2);

            const expected: Site[] = [
                {
                    meteringPointMrid: 'PRM00000000234766',
                    systemOperatorMarketParticipantMrid: '17V0000009927468',
                    producerMarketParticipantMrid: '17X000001307745X',
                    technologyType: 'Eolien',
                    siteType: 'Injection',
                    siteName: 'Ferme éolienne de Genonville',
                    substationMrid: 'GDO A4RTD',
                    substationName: 'CIVRAY',
                    siteAdminMrid: '489 981 029',
                    siteLocation: 'Biscarosse',
                    siteIecCode: 'S7X0000013077453',
                    systemOperatorEntityFlexibilityDomainMrid: 'PSC4566',
                    systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                    systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
                    docType: 'site'
                  },
                  {
                    meteringPointMrid: 'PDL00000000289767',
                    systemOperatorMarketParticipantMrid: '17V0000009927469',
                    producerMarketParticipantMrid: '17X000001307745X',
                    technologyType: 'Eolien',
                    siteType: 'Injection',
                    siteName: 'Ferme éolienne de Genonville',
                    substationMrid: 'GDO A4RTD',
                    substationName: 'CIVRAY',
                    marketEvaluationPointMrid: 'CodePPE',
                    schedulingEntityRegisteredResourceMrid: 'CodeEDP',
                    siteAdminMrid: '489 981 029',
                    siteLocation: 'Biscarosse',
                    siteIecCode: 'S7X0000013077478',
                    systemOperatorEntityFlexibilityDomainMrid: 'PSC4511',
                    systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                    systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
                    docType: 'site'
                  }
            ];

            expect(retProd).to.eql(expected);
        });
*/
    });
});