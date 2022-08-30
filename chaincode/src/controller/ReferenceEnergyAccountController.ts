import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';
import { DocType } from '../enums/DocType';

import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';
import { DataReference } from '../model/dataReference';

import { QueryStateService } from './service/QueryStateService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ReferenceEnergyAccountService } from './service/ReferenceEnergyAccountService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { StarDataService } from './service/StarDataService';

export class ReferenceEnergyAccountController {



    public static async createReferenceEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Create ReferenceEnergyAccount ===========');

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount-> Input string NON-JSON value`);
        }

        EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        await ReferenceEnergyAccountController.createReferenceEnergyAccountObj(params, energyObj);

        console.debug('============= END   : Create %s ReferenceEnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }



    public static async createReferenceEnergyAccountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        console.debug('============= START : Create ReferenceEnergyAccount by Reference ===========');

        await ReferenceEnergyAccountController.createReferenceEnergyAccountObj(params, dataReference.data, dataReference.collection);

        console.debug('============= END   : Create %s ReferenceEnergyAccount by Reference ===========',
            dataReference.data.energyAccountMarketDocumentMrid,
        );
    }



    public static async createReferenceEnergyAccountObj(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = '') {
        console.debug('============= START : Create ReferenceEnergyAccount Obj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Reference Energy Account.`);
        }


        if (!energyObj.marketEvaluationPointMrid) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.`);
        } else if (!energyObj.processType) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing processType.`);
        }

        let siteObj: Site;
        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
            var siteObjRef:DataReference;
            if (target && target.length > 0) {
                siteObjRef = existingSitesRef.get(target);
            } else {
                siteObjRef = existingSitesRef.values().next().value;
            }
            siteObj = siteObjRef.data;
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message).concat(` for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(params, {id: energyObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message).concat(` for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Reference Energy Account, mismatch sender: ${identity} does not have write access for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyObj.senderMarketParticipantMrid) {
            throw new Error(`Reference Energy Account, sender: ${energyObj.senderMarketParticipantMrid} is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount creation.`);
        }

        if (target && target.length > 0) {
            await ReferenceEnergyAccountService.write(params, energyObj, target);
        }else {
            for (var [key, ] of existingSitesRef) {
                await ReferenceEnergyAccountService.write(params, energyObj, key);
            }
        }

        console.debug('============= END   : Create %s ReferenceEnergyAccount Obj ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }




    public static async getReferenceEnergyAccountForSystemOperator(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const allResults = await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperatorObj(
            params, meteringPointMrid, systemOperatorEicCode, startCreatedDateTime);
        const formated = JSON.stringify(allResults);

        return formated;

    }


    public static async getReferenceEnergyAccountForSystemOperatorObj(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string,
        target: string = ''): Promise<any[]> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have read access for Reference Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        try {
            await StarDataService.getObj(params, {id: systemOperatorEicCode, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message));
        }

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //     "selector":
        //     {
        //         "docType": "referenceEnergyAccount",
        //         "meteringPointMrid": "${meteringPointMrid}",
        //         "createdDateTime": {
        //             "$gte": ${JSON.stringify(dateUp)},
        //             "$lte": ${JSON.stringify(dateDown)}
        //         },
        //         "sort": [{
        //             "createdDateTime" : "desc"
        //         }]
        //     }
        // }`;

        const allResults = await ReferenceEnergyAccountService.getQueryArrayResult(params, query, target);
        return allResults;
    }




    public static async getReferenceEnergyAccountByProducer(
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Reference Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid": "${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //         "selector":
        //         {
        //             "docType": "referenceEnergyAccount",
        //             "meteringPointMrid": "${meteringPointMrid}",
        //             "receiverMarketParticipantMrid": "${producerEicCode}",
        //             "createdDateTime": {
        //                 "$gte": ${JSON.stringify(dateUp)},
        //                 "$lte": ${JSON.stringify(dateDown)}
        //             },
        //             "sort": [{
        //                 "createdDateTime" : "desc"
        //             }]
        //         }
        //     }`;

        const allResults = await ReferenceEnergyAccountService.getQueryStringResult(params, query);
        return allResults;
    }
}
