import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';

import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';

import { QueryStateService } from './service/QueryStateService';
import { SiteService } from './service/SiteService';
import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';
import { EnergyAccountService } from './service/EnergyAccountService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { DataReference } from '../model/dataReference';
import { SiteController } from './SiteController';

export class EnergyAccountController {

    public static async createEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Create EnergyAccount ===========');

        const energyObj:EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(ctx, params, energyObj);

        console.info("33333333333333333333333333333333")
        //Get existing sites
        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await SiteService.getObjRefbyId(ctx, params, energyObj.meteringPointMrid);
        } catch(error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` Can not be created.`));
        }
        console.info("44444444444444444444444444444")

        // for (var [key, ] of existingSitesRef) {
        //     await EnergyAccountService.write(ctx, params, energyObj, key);
        // }

        console.debug('============= END   : Create %s EnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }

    public static async createEnergyAccountByReference(
        ctx: Context,
        params: STARParameters,
        dataReference: DataReference) {
        console.debug('============= START : Create EnergyAccount by Reference ===========');

        await EnergyAccountController.checkEnergyAccountObj(ctx, params, dataReference.data, dataReference.collection);
        await EnergyAccountService.write(ctx, params, dataReference.data, dataReference.collection);

        console.debug('============= END   : Create %s EnergyAccount by Reference ===========',
            dataReference.data.energyAccountMarketDocumentMrid,
        );
    }

    public static async updateEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Update EnergyAccount ===========');

        const energyObj:EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(ctx, params, energyObj);

        //Get existing data
        var existingEnergyAccountRef:Map<string, DataReference>;
        try {
            existingEnergyAccountRef = await EnergyAccountService.getObjRefbyId(ctx, params, energyObj.energyAccountMarketDocumentMrid);
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        for (var [key, ] of existingEnergyAccountRef) {
            await EnergyAccountService.write(ctx, params, energyObj, key);
        }

        console.debug('============= END   : Update %s EnergyAccount ===========',
        energyObj.energyAccountMarketDocumentMrid,
        );
    }




    private static async checkEnergyAccountObj(
        ctx: Context,
        params: STARParameters,
        energyObj:EnergyAccount,
        target: string = ''): Promise<void>{

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        let siteObj: Site;
        // try {
        //     siteObj = await SiteController.getSiteById(ctx, params, energyObj.meteringPointMrid, target);
        // } catch(error) {
        //     throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        // }
        console.info("1111111111111111111111")
        var siteRef: DataReference;
        try {
            const siteRefMap: Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, energyObj.meteringPointMrid);
            siteRef = siteRefMap.get(target);
        } catch(error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }
        console.info("1.1.1.1.1.1.1111111111")
        console.debug("SiteRef")
        console.debug(JSON.stringify(siteRef))
        console.debug("target")
        console.debug(target)
        console.debug("energyObj")
        console.debug(JSON.stringify(energyObj))

        if (!siteRef
            || siteRef.collection !== target || !target || target.length == 0
            || !siteRef.data.meteringPointMrid
            || siteRef.data.meteringPointMrid != energyObj.meteringPointMrid) {
                throw new Error(`ERROR createEnergyAccount : Site : ${energyObj.meteringPointMrid}  for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`);
        }
        siteObj = siteRef.data;
        console.info("222222222222222222222222")


        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, energyObj.senderMarketParticipantMrid);
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not have write access for ${energyObj.energyAccountMarketDocumentMrid}. (Wrong SystemOperator)`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyObj.senderMarketParticipantMrid) {
            throw new Error(`Energy Account, sender: ${energyObj.senderMarketParticipantMrid} does is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount.`);
        }

        if (identity === OrganizationTypeMsp.RTE && !energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, missing marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        } else if (identity === OrganizationTypeMsp.ENEDIS && energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, presence of marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        }
    }


    public static async dataExists(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {

        let existing: boolean = false;
        const result:Map<string, DataReference> = await EnergyAccountService.getObjRefbyId(ctx, params, id);
        if (target && target.length > 0) {
            const dataReference: DataReference = result.get(target);
            existing = dataReference
                && dataReference.data
                && dataReference.data.energyAccountMarketDocumentMrid == id;
        } else {
            existing = result
                && result.values().next().value
                && result.values().next().value.data
                && result.values().next().value.data.energyAccountMarketDocumentMrid == id;
        }

        return existing;
    }






    public static async getEnergyAccountForSystemOperator(
            ctx: Context,
            params: STARParameters,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {

        const allResults = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            ctx, params, meteringPointMrid, systemOperatorEicCode, startCreatedDateTime);
        const formated = JSON.stringify(allResults);

        return formated;
    }




    public static async getEnergyAccountForSystemOperatorObj(
        ctx: Context,
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string,
        target: string = ''): Promise<any[]> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, systemOperatorEicCode);
        } catch (error) {
            throw new Error('ERROR getEnergyAccountForSystemOperator : '.concat(error.message).concat(` for Energy Account read.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not provide his own systemOperatorEicCode therefore he does not have read access.`,
            );
        }
        // let query;

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte": ${JSON.stringify(dateDown)}}`);

        if (identity !== OrganizationTypeMsp.RTE) {
            args.push(`"senderMarketParticipantMrid": "${systemOperatorEicCode}"`);
        }

        // const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args);

        return await EnergyAccountService.getQueryArrayResult(ctx, params, query, target);
    }





    public static async getEnergyAccountByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any> {

            const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        let results = await EnergyAccountService.getQueryArrayResult(ctx, params, query);
        return results;
    }





    public static async getEnergyAccountByProducer(
        ctx: Context,
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid":"${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid":"${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);

        // const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args);

        const allResults = await EnergyAccountService.getQueryArrayResult(ctx, params, query);
        const formated = JSON.stringify(allResults);
        return formated;
    }
}
