'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { EnergyAmount } from '../src/model/energyAmount';
import { ActivationDocument } from '../src/model/activationDocument/activationDocument';
import { STARParameters } from '../src/model/starParameters';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersType } from '../src/enums/ParametersType';
import { ParametersController } from '../src/controller/ParametersController';
import { DocType } from '../src/enums/DocType';
import { HLFServices } from '../src/controller/service/HLFservice';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { CommonService } from '../src/controller/service/CommonService';
import { IndexedDataJson } from '../src/model/dataIndexersJson';
import { EnergyAmountAbstract } from '../src/model/dataIndex/energyAmountAbstract';
import { IndexedData } from '../src/model/dataIndex/dataIndexers';
import { ActivationEnergyAmountIndexersController } from '../src/controller/dataIndex/ActivationEnergyAmountIndexersController';


class TestLoggerMgt {
    public getLogger(arg: string): any {
        return console;
    }
}

class TestContext {
    clientIdentity: any;
    stub: any;
    logger: TestLoggerMgt= new TestLoggerMgt();

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns(Values.FakeMSP);
        this.stub = sinon.createStubInstance(ChaincodeStub);
    }
}

function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}

describe('Star Tests EnergyAmount', () => {
    let transactionContext: any;
    let mockHandler:any;
    let star: Star;
    beforeEach(() => {
        transactionContext = new TestContext();
        star = new Star();
        mockHandler = sinon.createStubInstance(ChaincodeMessageHandler);

        chai.should();
        chai.use(chaiAsPromised);
        chai.use(sinonChai);
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await transactionContext.stub.getState("EolienFRvert28EIC");
            await transactionContext.stub.getQueryResult("EolienFRvert28EIC");
        });
    });
////////////////////////////////////////////////////////////////////////////
///////////////////////////////     ENE      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateTSOEnergyAmount', () => {
        it('should return ERROR CreateTSOEnergyAmount check mandatory fields', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const errors = [
                'activationDocumentMrid is a compulsory string',
                'areaDomain is a compulsory string',
                'createdDateTime is a compulsory string',
                'energyAmountMarketDocumentMrid is a compulsory string',
                'measurementUnitName is a compulsory string',
                'quantity is a compulsory string',
                'receiverMarketParticipantMrid is a compulsory string',
                'receiverMarketParticipantRole is a compulsory string',
                // 'registeredResourceMrid is a compulsory string',
                'senderMarketParticipantMrid is a compulsory string',
                'senderMarketParticipantRole is a compulsory string',
                'timeInterval is a compulsory string'
            ];

            var input: string
            input = JSON.stringify(Values.HTB_EnergyAmount);
            input = await Values.deleteJSONField(input, "activationDocumentMrid");
            input = await Values.deleteJSONField(input, 'areaDomain');
            input = await Values.deleteJSONField(input, 'createdDateTime');
            input = await Values.deleteJSONField(input, 'energyAmountMarketDocumentMrid');
            input = await Values.deleteJSONField(input, 'measurementUnitName');
            input = await Values.deleteJSONField(input, 'quantity');
            input = await Values.deleteJSONField(input, 'receiverMarketParticipantMrid');
            input = await Values.deleteJSONField(input, 'receiverMarketParticipantRole');
            input = await Values.deleteJSONField(input, 'registeredResourceMrid');
            input = await Values.deleteJSONField(input, 'senderMarketParticipantMrid');
            input = await Values.deleteJSONField(input, 'senderMarketParticipantRole');
            input = await Values.deleteJSONField(input, 'timeInterval');

            try {
                await star.CreateTSOEnergyAmount(transactionContext, input);
            } catch(err) {
                // params.logger.info(input);
                // params.logger.info(err)
                expect(err.errors[0]).to.equal(errors[0]);
                expect(err.errors[1]).to.equal(errors[1]);
                expect(err.errors[2]).to.equal(errors[2]);
                expect(err.errors[3]).to.equal(errors[3]);
                expect(err.errors[4]).to.equal(errors[4]);
                expect(err.errors[5]).to.equal(errors[5]);
                expect(err.errors[6]).to.equal(errors[6]);
                expect(err.errors[7]).to.equal(errors[7]);
                expect(err.errors[8]).to.equal(errors[8]);
                expect(err.errors[9]).to.equal(errors[9]);
                expect(err.errors[10]).to.equal(errors[10]);
                // expect(err.errors[11]).to.equal(errors[11]);
                // expect(err.message).to.equal('12 errors occurred');
                expect(err.message).to.equal('11 errors occurred');
            }
        });

        it('should return ERROR on CreateTSOEnergyAmount NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateTSOEnergyAmount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.ENERGY_AMOUNT).concat(' -> Input string NON-JSON value'));
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Wrong MSPID', async () => {
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(Values.HTB_EnergyAmount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${Values.FakeMSP} does not have write access for Energy Amount.`);
            }
        });

        it('should return ERROR CreateTSOEnergyAmount missing Activation Document.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(Values.HTB_EnergyAmount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(DocType.ACTIVATION_DOCUMENT.concat(' : ').concat(Values.HTB_EnergyAmount.activationDocumentMrid).concat(' does not exist (not found in any collection). for Energy Amount ').concat(Values.HTB_EnergyAmount.energyAmountMarketDocumentMrid).concat(' creation.'));
            }
        });

        it('should return ERROR CreateTSOEnergyAmount error in Interval End Date.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            energyamount.timeInterval = `${Values.HTB_ActivationDocument_Valid.startCreatedDateTime}/`
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENE : '
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat("/")
                .concat()
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat("/")
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.endCreatedDateTime as string))
                .concat(' dates.'));
            }
        });

        it('should return ERROR CreateTSOEnergyAmount error in Interval Start Date.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            energyamount.timeInterval = `/${Values.HTB_ActivationDocument_Valid.endCreatedDateTime}`
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENE : '
                .concat()
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat(' dates.'));
            }
        });



        it('should return ERROR CreateTSOEnergyAmount error in Interval Start Date before Activation Document Start.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const dateStart = CommonService.reduceDateDaysStr(JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid.startCreatedDateTime))  as string, 1);
            const dateEnd = Values.HTB_ActivationDocument_Valid.endCreatedDateTime;
            energyamount.timeInterval = `${dateStart}/${dateEnd}`;

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENE : '
                .concat(CommonService.formatDateStr(dateStart as string))
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat(' dates.'));
            }
        });


        it('should return ERROR CreateTSOEnergyAmount error in Interval End Date after Activation Document End.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const dateStart = Values.HTB_ActivationDocument_Valid.startCreatedDateTime;
            const dateEnd = CommonService.increaseDateDaysStr(JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid.endCreatedDateTime))  as string, 1);
            energyamount.timeInterval = `${dateStart}/${dateEnd}`;

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENE : '
                .concat(CommonService.formatDateStr(dateStart as string))
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat(' dates.'));
            }
        });



        it('should return SUCCESS CreateTSOEnergyAmount.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));

            const expected = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount))
            expected.docType = DocType.ENERGY_AMOUNT;

            const indexedDataAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: expected.energyAmountMarketDocumentMrid
            }

            const expectedIndexer: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractMap : new Map(),
                indexId: ActivationEnergyAmountIndexersController.getKey(expected.activationDocumentMrid),
            }
            expectedIndexer.indexedDataAbstractMap.set(expected.activationDocumentMrid, indexedDataAbstract);
            const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexerJSON))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collection,
                expected.energyAmountMarketDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                collection,
                expectedIndexerJSON.indexId,
                Buffer.from(JSON.stringify(expectedIndexerJSON))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
        });




        it('should return SUCCESS CreateTSOEnergyAmountList.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            const energyamount2:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount_2));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collection,
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            transactionContext.stub.getPrivateData.withArgs(collection, Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const energyAmountList: EnergyAmount[] = [energyamount, energyamount2];
            await star.CreateTSOEnergyAmountList(transactionContext, JSON.stringify(energyAmountList));

            const expected = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount))
            expected.docType = DocType.ENERGY_AMOUNT;
            const expected2 = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount_2))
            expected2.docType = DocType.ENERGY_AMOUNT;

            const indexedDataAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: expected.energyAmountMarketDocumentMrid
            }

            const expectedIndexer: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractMap : new Map(),
                indexId: ActivationEnergyAmountIndexersController.getKey(expected.activationDocumentMrid),
            }
            expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
            const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

            const indexedDataAbstract2: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: expected2.energyAmountMarketDocumentMrid
            }

            const expectedIndexer2: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractMap : new Map(),
                indexId: ActivationEnergyAmountIndexersController.getKey(expected2.activationDocumentMrid),
            }
            expectedIndexer2.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract2);
            const expectedIndexer2JSON = IndexedDataJson.toJson(expectedIndexer2);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexerJSON))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected2))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexer2JSON))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
                collection,
                expected.energyAmountMarketDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
                collection,
                expectedIndexerJSON.indexId,
                Buffer.from(JSON.stringify(expectedIndexerJSON))
            );

            transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
                collection,
                expected2.energyAmountMarketDocumentMrid,
                Buffer.from(JSON.stringify(expected2))
            );

            transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
                collection,
                expectedIndexer2JSON.indexId,
                Buffer.from(JSON.stringify(expectedIndexer2JSON))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(4);
        });





        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                energyamount.activationDocumentMrid).resolves(Buffer.from("XXX"));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR ${DocType.ACTIVATION_DOCUMENT} -> Input string NON-JSON value for Energy Amount ${energyamount.energyAmountMarketDocumentMrid} creation.`);
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.site.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            activationDocument.registeredResourceMrid = 'toto';
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`site : toto does not exist (not found in any collection). for Energy Amount ${energyamount.energyAmountMarketDocumentMrid} creation.`);
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken Site.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from("XXX"));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR site -> Input string NON-JSON value for Energy Amount ${energyamount.energyAmountMarketDocumentMrid} creation.`);
            }
        });

        it('should return ERROR CreateTSOEnergyAmount mismatch registeredResourceMrid.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                energyamount.registeredResourceMrid = "toto";
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Site : ${energyamount.registeredResourceMrid} does not exist for Energy Amount ${energyamount.energyAmountMarketDocumentMrid} creation.`);
            }
        });

        //Deleted ERROR ?
        // it('should return ERROR CreateTSOEnergyAmount mismatch date timeInterval.', async () => {

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // params.logger.info(err.message)
        //         expect(err.message).to.equal('ERROR createTSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        it('should return ERROR CreateTSOEnergyAmount mismatch date.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                Values.HTB_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_Valid)));

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const dateStartInit = CommonService.reduceDateDaysStr(JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid.startCreatedDateTime))  as string, 30);
            const dateStart = CommonService.setHoursStartDayStr(dateStartInit);

            const dateEnd = CommonService.reduceDateTimeStr(dateStart, -23*60*60*1000);
            try {
                energyamount.timeInterval = `${dateStart}/${dateEnd}`;
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENE : '
                .concat(CommonService.formatDateStr(dateStart))
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat(' dates.'));
            }
        });
    });
////////////////////////////////////////////////////////////////////////////
///////////////////////////////     ENI      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateDSOEnergyAmount', () => {
        it('should return ERROR CreateDSOEnergyAmount Wrong MSPID', async () => {
            try {
                await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(Values.HTA_EnergyAmount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${Values.FakeMSP} does not have write access for Energy Amount.`);
            }
        });

        it('should return ERROR on CreateDSOEnergyAmount NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            try {
                await star.CreateDSOEnergyAmount(transactionContext, 'RTE01EIC');
            } catch(err) {
                expect(err.message).to.equal('ERROR '.concat(DocType.ENERGY_AMOUNT).concat(' -> Input string NON-JSON value'));
            }
        });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount no result get ActivationDocument.', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-23T11:29:10.000Z/2021-10-23T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // params.logger.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount : no results for get activationDocument');
        //     }
        // });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount error date interval.', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-22T11:29:10.000Z/2021-10-22T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // params.logger.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount error date ENI / timeinterval.', async () => {
        //     transactionContext.stub.MspiID = OrganizationTypeMsp.ENEDIS;
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-22T11:29:10.000Z/2021-10-22T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // params.logger.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        it('should return ERROR CreateDSOEnergyAmount error date ENI / ActivationDocument.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collections[0],
                Values.HTA_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_ActivationDocument_Valid)));

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_EnergyAmount.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const dateStartInit = CommonService.reduceDateDaysStr(JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid.startCreatedDateTime))  as string, 30);
            const dateStart = CommonService.setHoursStartDayStr(dateStartInit);

            const dateEnd = CommonService.reduceDateDaysStr(JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid.endCreatedDateTime))  as string, 30);
            try {
                const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));
                energyamount.timeInterval = `${dateStart}/${dateEnd}`;
                await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR manage EnergyAmount mismatch between ENI : '
                .concat(CommonService.formatDateStr(dateStart))
                .concat(' and Activation Document : ')
                .concat(CommonService.formatDateStr(Values.HTB_ActivationDocument_Valid.startCreatedDateTime as string))
                .concat(' dates.'));
            }
        });

        it('should return SUCCESS CreateDSOEnergyAmount.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionsActivationDocument: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            transactionContext.stub.getPrivateData.withArgs(collectionsActivationDocument[0],
                Values.HTA_ActivationDocument_Valid.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_ActivationDocument_Valid)));

            const collections: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collections[0], Values.HTA_EnergyAmount.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(Values.HTA_EnergyAmount));

            const expected: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount))
            expected.docType = DocType.ENERGY_AMOUNT;

            const indexedDataAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: expected.energyAmountMarketDocumentMrid
            }

            const expectedIndexer: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractMap : new Map(),
                indexId: ActivationEnergyAmountIndexersController.getKey(expected.activationDocumentMrid),
            }
            expectedIndexer.indexedDataAbstractMap.set(expected.activationDocumentMrid, indexedDataAbstract);

            const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer)

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexerJSON))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collections[0],
                expected.energyAmountMarketDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                collections[0],
                expectedIndexerJSON.indexId,
                Buffer.from(JSON.stringify(expectedIndexerJSON))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
        });
    });

////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET ENE      /////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test ENE GetEnergyAmountForSystemOperator.', () => {
        it('should return ERROR on GetEnergyAmountForSystemOperator no systemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const producer = 'toto';
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, producer, producer, producer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR getEnergyAmountForSystemOperator : '.concat(DocType.SYSTEM_OPERATOR).concat(' : toto does not exist for Energy Amount read.'));
            }
        });

        it('should return SUCCESS on GetEnergyAmountForSystemOperator. empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const producer = 'toto';
            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, producer, Values.HTA_systemoperator.systemOperatorMarketParticipantMrid, "date");
            ret = JSON.parse(ret);
            // params.logger.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);

            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, '.concat(Values.FakeMSP).concat(' does not have read access for Energy Amount.'));
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong SystemOperator', async () => {
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext,
                    Values.HTB_EnergyAmount.registeredResourceMrid as string,
                    Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
                    Values.HTB_EnergyAmount.createdDateTime);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Energy Amount, sender: rte does not provide his own systemOperatorEicCode therefore he does not have read access.');
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Broken SystemOperator', async () => {
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from("XXX"));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext,
                    Values.HTB_EnergyAmount.registeredResourceMrid as string,
                    Values.HTB_EnergyAmount.senderMarketParticipantMrid,
                    Values.HTB_EnergyAmount.createdDateTime);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR getEnergyAmountForSystemOperator : ERROR '.concat(DocType.SYSTEM_OPERATOR).concat(' -> Input string NON-JSON value for Energy Amount read.'));
            }
        });


        it('should return SUCCESS on GetEnergyAmountForSystemOperator.', async () => {
            const iterator = Values.getQueryMockArrayValues([Values.HTB_EnergyAmount],mockHandler);

            const dateUp = new Date(Values.HTB_EnergyAmount.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"registeredResourceMrid":"${Values.HTB_EnergyAmount.registeredResourceMrid}"`);
            args.push(`"senderMarketParticipantMrid":"${Values.HTB_EnergyAmount.senderMarketParticipantMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

        //     const query = `{
        //     "selector":
        //     {
        //         "docType": "energyAmount",
        //         "registeredResourceMrid": "${Values.HTB_EnergyAmount.registeredResourceMrid}",
        //         "senderMarketParticipantMrid": "${Values.HTB_EnergyAmount.senderMarketParticipantMrid}",
        //         "createdDateTime": {
        //             "$gte": ${JSON.stringify(dateUp)},
        //             "$lte": ${JSON.stringify(dateDown)}
        //         },
        //         "sort": [{
        //             "createdDateTime" : "desc"
        //         }]
        //     }
        // }`;

            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext,
                                                                    Values.HTB_EnergyAmount.registeredResourceMrid as string,
                                                                    Values.HTB_EnergyAmount.senderMarketParticipantMrid,
                                                                    Values.HTB_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTB_EnergyAmount];

            expect(ret).to.eql(expected);
        });


        // it('should return SUCCESS on GetEnergyAmountForSystemOperator. for non JSON value.', async () => {

        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"bulshit\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-23T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj1 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
        //     let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret1=", ret1);
        //     expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

        //     const nrj2 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-23T10:29:10.000Z",
        //         timeInterval: "2021-10-23T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
        //     let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret2=", ret2);
        //     expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));


        //     let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
        //     ret = JSON.parse(ret);
        //     params.logger.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         "non-json-value",
        //         {
        //             docType: "energyAmount",
        //             energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             registeredResourceMrid: "PRM50012536123456",
        //             quantity: "number",
        //             measurementUnitName: "KW",
        //             revisionNumber: "1",
        //             businessType: "A14 / Z14",
        //             docStatus: "A02",
        //             processType: "A05",
        //             classificationType: "A02",
        //             areaDomain: "17X100A100A0001A",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             senderMarketParticipantRole: "A50",
        //             receiverMarketParticipantMrid: "Producteur1",
        //             receiverMarketParticipantRole: "A32",
        //             createdDateTime: "2021-10-22T10:29:10.000Z",
        //             timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //         }
        //     ];

        //     expect(ret).to.eql(expected);
        // });
    });

    describe('Test ENE GetEnergyAmountByProducer', () => {
        it('should return ERROR on GetEnergyAmountByProducer Wrong MSPID', async () => {
            try {
                await star.GetEnergyAmountByProducer(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${Values.FakeMSP} does not have read access for producer\'s Energy Amount.`);
            }
        });

        it('should return OK on GetEnergyAmountByProducer empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const producer = 'toto';
            let ret = await star.GetEnergyAmountByProducer(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // params.logger.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetEnergyAmountByProducer', async () => {
            const iterator = Values.getQueryMockArrayValues([Values.HTB_EnergyAmount],mockHandler);

            const dateUp = new Date(Values.HTB_EnergyAmount.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"registeredResourceMrid":"${Values.HTB_EnergyAmount.registeredResourceMrid}"`);
            args.push(`"receiverMarketParticipantMrid":"${Values.HTB_EnergyAmount.receiverMarketParticipantMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

            // const query = `{
            //     "selector":
            //     {
            //         "docType": "energyAmount",
            //         "registeredResourceMrid": "${Values.HTB_EnergyAmount.registeredResourceMrid}",
            //         "receiverMarketParticipantMrid": "${Values.HTB_EnergyAmount.receiverMarketParticipantMrid}",
            //         "createdDateTime": {
            //             "$gte": ${JSON.stringify(dateUp)},
            //             "$lte": ${JSON.stringify(dateDown)}
            //         },
            //         "sort": [{
            //             "createdDateTime" : "desc"
            //         }]
            //     }
            // }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            let ret = await star.GetEnergyAmountByProducer(transactionContext,
                                                            Values.HTB_EnergyAmount.registeredResourceMrid as string,
                                                            Values.HTB_EnergyAmount.receiverMarketParticipantMrid,
                                                            Values.HTB_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTB_EnergyAmount];

            expect(ret).to.eql(expected);
        });

        // it('should return SUCCESS on getEnergyAmountByProducer for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"bulshit\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj1 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
        //     let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret1=", ret1);
        //     expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123457\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
        //     const nrj2 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //         registeredResourceMrid: "PRM50012536123457",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
        //     let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret2=", ret2);
        //     expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
        //     let ret = await star.GetEnergyAmountByProducer(transactionContext, nrj1.registeredResourceMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
        //     ret = JSON.parse(ret);
        //     // params.logger.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "energyAmount",
        //             energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             registeredResourceMrid: "PRM50012536123456",
        //             quantity: "number",
        //             measurementUnitName: "KW",
        //             revisionNumber: "1",
        //             businessType: "A14 / Z14",
        //             docStatus: "A02",
        //             processType: "A05",
        //             classificationType: "A02",
        //             areaDomain: "17X100A100A0001A",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             senderMarketParticipantRole: "A50",
        //             receiverMarketParticipantMrid: "Producteur1",
        //             receiverMarketParticipantRole: "A32",
        //             createdDateTime: "2021-10-22T10:29:10.000Z",
        //             timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //         }
        //    ];

        //     expect(ret).to.eql(expected);
        // });
    });
////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET ENI      /////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test ENI GetEnergyAmountForSystemOperator.', () => {
        it('should return SUCCESS on GetEnergyAmountForSystemOperator.', async () => {
            const iterator = Values.getQueryMockArrayValues([Values.HTA_EnergyAmount],mockHandler);

            const dateUp = new Date(Values.HTA_EnergyAmount.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"registeredResourceMrid":"${Values.HTA_EnergyAmount.registeredResourceMrid}"`);
            args.push(`"senderMarketParticipantMrid":"${Values.HTA_EnergyAmount.senderMarketParticipantMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

        //     const query = `{
        //     "selector":
        //     {
        //         "docType": "energyAmount",
        //         "registeredResourceMrid": "${Values.HTA_EnergyAmount.registeredResourceMrid}",
        //         "senderMarketParticipantMrid": "${Values.HTA_EnergyAmount.senderMarketParticipantMrid}",
        //         "createdDateTime": {
        //             "$gte": ${JSON.stringify(dateUp)},
        //             "$lte": ${JSON.stringify(dateDown)}
        //         },
        //         "sort": [{
        //             "createdDateTime" : "desc"
        //         }]
        //     }
        // }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext,
                                                                    Values.HTA_EnergyAmount.registeredResourceMrid as string,
                                                                    Values.HTA_EnergyAmount.senderMarketParticipantMrid,
                                                                    Values.HTA_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTA_EnergyAmount];

            expect(ret).to.eql(expected);
        });

     });



    describe('Test ENI GetEnergyAmountByProducer', () => {
        it('should return SUCCESS on GetEnergyAmountByProducer', async () => {
            const iterator = Values.getQueryMockArrayValues([Values.HTA_EnergyAmount],mockHandler);

            const dateUp = new Date(Values.HTA_EnergyAmount.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"registeredResourceMrid":"${Values.HTA_EnergyAmount.registeredResourceMrid}"`);
            args.push(`"receiverMarketParticipantMrid":"${Values.HTA_EnergyAmount.receiverMarketParticipantMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

            // const query = `{
            //     "selector":
            //     {
            //         "docType": "energyAmount",
            //         "registeredResourceMrid": "${Values.HTA_EnergyAmount.registeredResourceMrid}",
            //         "receiverMarketParticipantMrid": "${Values.HTA_EnergyAmount.receiverMarketParticipantMrid}",
            //         "createdDateTime": {
            //             "$gte": ${JSON.stringify(dateUp)},
            //             "$lte": ${JSON.stringify(dateDown)}
            //         },
            //         "sort": [{
            //             "createdDateTime" : "desc"
            //         }]
            //     }
            // }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            let ret = await star.GetEnergyAmountByProducer(transactionContext,
                                                            Values.HTA_EnergyAmount.registeredResourceMrid as string,
                                                            Values.HTA_EnergyAmount.receiverMarketParticipantMrid,
                                                            Values.HTA_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTA_EnergyAmount];

            expect(ret).to.eql(expected);
        });
    });
});
