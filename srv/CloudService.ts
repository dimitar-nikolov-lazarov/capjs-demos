import { LOB, VM } from "#cds-models/CloudService";
import { Platform } from "#cds-models/my/cloud";
import { ApplicationService } from "@sap/cds";
import * as cds from '@sap/cds'

/**
 * 
 */
export class CloudService extends ApplicationService {
    override async init(): Promise<void> {
        const r = await super.init();
        this.on("getLOBMemory", async (request): Promise<number> => {
            const totalMemory = await this.getTotalMemory();
            return totalMemory;
        });
        return r;

    }

    protected async getTotalMemory(): Promise<number> {
        /*
            "Downsides or problems"
            I) where predicate
                1) where predicate could accept any attribute names.
                2) TS is not going to faild on build - need runtime check.
            II) "result projection or column definition"
                1) TS did not recognize the query result.

            What we want:
            I) where predicate to have TS build issues.
                1) to allow us to specify only attributes of from(Entity)
                2) to allow us to specify only values that match attribute type. if attribute is number - not to allow us to set {memoryMB: 'asd'}
                3) "path"/navigation properties . Same as above two points, but to be valid for navigation/projection properties
                 or at least for composition or association to one

            What we gain:
            I) If something is changed on models - existing queries will faild during build phase.
            II) Better way to discover bugs during development with minimal run test and executions.
        */
        const whereClause: EntityFilterPredicate<VM> = {
            "lob.name": {
                like: "%LOB%"
            },
            or: {
                platform: Platform.GCP,
                or: {
                    "machineType.cpuCount": {
                        ">=": 4
                    }
                }
            },

        }
        const queryWithProjection = SELECT.from(VM, (vm) => {
            vm.lob(x => {
                x.name
            }),
                vm.platformId,
                vm.platform,
                vm.machineType(x => {
                    x.memoryMB
                })
        }).where(whereClause)

        const whereClause_wrong_attribute: EntityFilterPredicate<VM> = {
            "lob.name": {
                "like": "%LOB%"
            },
            "or": {
                platformm: Platform.AWS,
                "or": {
                    "lob.not_found_attribute": 222
                }
            }
        }
        const whereClause_wrong_type: EntityFilterPredicate<VM> = {
            "lob.name": {
                "like": "%LOB%"
            },
            "or": {
                platform: 123
            }
        }


        const queryWithColumnPaths = SELECT.from(VM)
            .columns("lob.name as lobName", "platformId", "platform", "machineType.memoryMB")
            .where(whereClause)
        const queryWithSUM = SELECT.from(VM)
            .columns("SUM(machineType.memoryMB) as totalMemoryMB", "lob.name")
            .where(whereClause)
            .groupBy("lob.name");

        const resultFromProjection = await queryWithProjection;
        const resultFromColumnPaths = await queryWithColumnPaths;
        const resultFromSUM = await queryWithSUM;

        let totalMemory_Projection = 0;
        resultFromProjection.forEach(x => {
            const memoryMB_from_row = x.machineType!.memoryMB ?? 0;
            totalMemory_Projection += memoryMB_from_row;
        })

        let totalMemoryColumnPath = 0;
        resultFromColumnPaths.forEach((x: (VM & { machineType_memoryMB?: number })) => {
            const memoryMB_from_row = x.machineType_memoryMB ?? 0; // First inconvinient - we did not have projection of this attribute. Deal with later somehow
            totalMemoryColumnPath += memoryMB_from_row;
        })

        let totalMemorySUM = 0;
        resultFromSUM.forEach((x: (VM & { totalMemoryMB?: number })) => {
            const memoryMB_from_row = x.totalMemoryMB ?? 0; // First inconvinient - we did not have projection of this attribute. Deal with later somehow
            totalMemorySUM += memoryMB_from_row;
        })
        if (totalMemory_Projection !== totalMemoryColumnPath || totalMemory_Projection !== totalMemorySUM) {
            throw new Error(`Both queries get different result.`);
        }
        return totalMemory_Projection;
    }
}