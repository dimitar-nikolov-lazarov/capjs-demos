using my.cloud as my from '../db/schema';

service CloudService {
    @readonly entity VM as projection on my.VM;
    @readonly entity LOB as projection on my.LOB;
    @readonly entity MachineType as projection on my.MachineType;

    function getLOBMemory() returns Integer64;
}
