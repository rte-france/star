import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { EnergyAccount } from '../model/energyAccount';

export class EnergyAccountController {

    public static async createEnergyAccount(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create EnergyAccount ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount-> Input string NON-JSON value`);
        }

        const energyAccountInput = EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        const siteAsBytes = await ctx.stub.getState(energyAccountInput.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${energyAccountInput.meteringPointMrid} does not exist for Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`);
        }

        energyAccountInput.docType = 'energyAccount';

        await ctx.stub.putState(
            energyAccountInput.energyAccountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAccountInput)),
        );
        console.info(
            '============= END   : Create %s EnergyAccount ===========',
            energyAccountInput.energyAccountMarketDocumentMrid,
        );
    }

    public static async getAllEnergyAccount(ctx: Context): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "energyAccount"}}`;
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}