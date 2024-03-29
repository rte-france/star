import { DataActionType } from '../enums/DataActionType';
import { DocType } from '../enums/DocType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';
import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { IndexedData } from '../model/dataIndex/dataIndexers';

import { DataReference } from '../model/dataReference';
import { STARParameters } from '../model/starParameters';
import { ActivationDocumentController } from './activationDocument/ActivationDocumentController';
import { EligibilityController } from './activationDocument/EligibilityController';
import { OrderManagerController } from './activationDocument/OrderManagerController';
import { ActivationCompositeKeyIndexersController } from './dataIndex/ActivationCompositeKeyIndexersController';
import { ActivationEnergyAmountIndexersController } from './dataIndex/ActivationEnergyAmountIndexersController';
import { DataIndexersController } from './dataIndex/DataIndexersController';
import { SiteActivationIndexersController } from './dataIndex/SiteActivationIndexersController';
import { SiteReserveBidIndexersController } from './dataIndex/SiteReserveBidIndexersController';

import { DataIndexersService } from './service/DataIndexersService';

export class StarDataUpdateController {
    public static async getStarDataToUpdate(
        params: STARParameters): Promise<string> {
        params.logger.info('============= START : getStarDataToUpdate StarDataUpdateController ===========');

        let stateStr = '[]';
        // const listOfIndexers = await this.getAllIndexersToDelete(params);
        // const listOfIndexers = await this.getAllIndexersToCreate(params);
        const listOfIndexers = await this.getActivationDocumentToShare(params);
        stateStr = JSON.stringify(listOfIndexers);

        params.logger.info('=============  END  : getStarDataToUpdate StarDataUpdateController ===========');

        return stateStr;

    }

    public static async executeStarDataOrders(
        params: STARParameters,
        inputStr: string) {

        params.logger.info('============= START : executeStarDataOrders StarDataUpdateController ===========');

        let updateOrders: DataReference[];
        try {
            updateOrders = JSON.parse(inputStr);
        } catch (error) {
        // params.logger.error('error=', error);
            throw new Error(`ERROR executeStarDataOrders -> Input string NON-JSON value`);
        }

        if (updateOrders && updateOrders.length > 0 ) {
            // VALIDATION AND INITIALIZATION STEP
            for (const updateOrder of updateOrders) {
                DataReference.schema.validateSync(
                    updateOrder,
                    {strict: true, abortEarly: false},
                );

                if (updateOrder.docType === DocType.ACTIVATION_DOCUMENT) {
                    await OrderManagerController.executeOrder(params, updateOrder);
                } else if (updateOrder.dataAction === DataActionType.DELETE
                    && updateOrder.docType === DocType.DATA_INDEXER) {
                    const indexer: IndexedData = updateOrder.data;
                    await DataIndexersService.delete(params, indexer.indexId, updateOrder.collection);
                } else if (updateOrder.docType === DocType.INDEX_ACTIVATION_COMPOSITE_KEY) {
                    await ActivationCompositeKeyIndexersController.executeOrder(params, updateOrder);
                } else if (updateOrder.docType === DocType.INDEX_ACTIVATION_ENERGYAMOUNT) {
                    await ActivationEnergyAmountIndexersController.executeOrder(params, updateOrder);
                } else if (updateOrder.docType === DocType.INDEX_SITE_ACTIVATION) {
                    await SiteActivationIndexersController.executeOrder(params, updateOrder);
                } else if (updateOrder.docType === DocType.INDEX_SITE_RESERVE_BID) {
                    await SiteReserveBidIndexersController.executeOrder(params, updateOrder);
                }

            }
        }

        params.logger.info('=============  END  : executeStarDataOrders StarDataUpdateController ===========');
        }

    private static async getActivationDocumentToShare(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : getActivationDocumentToShare StarDataUpdateController ===========');

        const activationDocumentList: DataReference[] = [];

        const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","eligibilityStatus":"true"}}`;

        const formatedResults: ActivationDocument[] =
            await ActivationDocumentController.getActivationDocumentObjByQuery(params, query, ['enedis-producer']);

        if (formatedResults && formatedResults.length > 0) {
            for (const formatedResult of formatedResults) {
                const referencedDocument: DataReference = {collection: 'enedis-producer-rte',
                    data: formatedResult,
                    dataAction: DataActionType.COLLECTION_CHANGE,
                    docType: DocType.ACTIVATION_DOCUMENT,
                    previousCollection: 'enedis-producer'};

                // const requirements =
                //     await EligibilityController.getCreationRequierments(
                //        params, referencedDocument, 'enedis-producer');
                // for (const requirement of requirements) {
                //     activationDocumentList.push(requirement);
                // }

                activationDocumentList.push(referencedDocument);

                // const linkedData =
                //     await EligibilityController.getCreationLinkedData(params, referencedDocument, 'enedis-producer');
                // for (const data of linkedData) {
                //     activationDocumentList.push(data);
                // }

            }
        }

        params.logger.info('=============  END  : getActivationDocumentToShare StarDataUpdateController ===========');
        return activationDocumentList;
    }

    private static async getAllIndexersToDelete(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : getAllIndexersToDelete StarDataUpdateController ===========');

        const listOfIndexers = await DataIndexersController.getAll(params);
        const listOfIndexersWithAction: DataReference[] = [];

        if (listOfIndexers && listOfIndexers.length > 0) {
            for (const indexer of listOfIndexers) {
                if (indexer.data
                    && !indexer.data.indexId
                    && indexer.data.activationDocumentCompositeKey
                    && indexer.data.activationDocumentCompositeKey.length > 0) {

                    indexer.data.indexId = indexer.data.activationDocumentCompositeKey;
                }
                if (indexer.data
                    && indexer.data.indexId
                    && indexer.data.indexId.length > 0) {

                        indexer.dataAction = DataActionType.DELETE;
                        listOfIndexersWithAction.push(indexer);
                }
            }
        }

        params.logger.info('=============  END  : getAllIndexersToDelete StarDataUpdateController ===========');
        return listOfIndexersWithAction;
    }

    private static async getAllIndexersToCreate(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : getAllIndexersToDelete StarDataUpdateController ===========');

        const indexSiteReservBidList = await SiteReserveBidIndexersController.getNeededIndexesFromData(params);
        const indexSiteActivationList = await SiteActivationIndexersController.getNeededIndexesFromData(params);
        const indexActivationCompositeKeyList =
             await ActivationCompositeKeyIndexersController.getNeededIndexesFromData(params);
        const indexEnergyList = await ActivationEnergyAmountIndexersController.getNeededIndexesFromData(params);

        let indexList: DataReference[] = [];
        indexList = indexList.concat(indexSiteReservBidList);
        indexList = indexList.concat(indexSiteActivationList);
        indexList = indexList.concat(indexActivationCompositeKeyList);
        indexList = indexList.concat(indexEnergyList);

        params.logger.info('=============  END  : getAllIndexersToDelete StarDataUpdateController ===========');
        return indexList;
    }

}
