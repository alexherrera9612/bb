const commands = {
    EXT_TO_P1:{
        cmd:    1,
        args:   []
    },
    EXT_TO_S0:{
        cmd:    2,
        args:   []
    },
    P1_TO_EXT:{
        cmd:    3,
        args:   []
    },
    S0_TO_EXT:{
        cmd:    4,
        args:   []
    },
    PLAT_P1:{
        cmd:    5,
        args:   []
    },
    PLAT_S0:{
        cmd:    6,
        args:   []
    },
}

const request = {
    STATUS_DEVICE:{
        cmd:    1,
        args:   []
    },
    STATUS_SENSOR:{
        cmd:    2,
        args:   []
    },
    STATUS_PLATFORM:{
        cmd:    3,
        args:   []
    },
    STATUS_SEMAFORO:{
        cmd:    4,
        args:   []
    },
    
}

const config = {
    reset:{                     cmd:1,args:[0]},    //Reset module
    timeState_reloader:{        cmd:4,args:[2]},    //Tiempo de estado del relevo
    timeSensor_reloader:{       cmd:5,args:[15]},   //Tiempo del sensor
    overTime_reloader:{         cmd:6,args:[120]},   //Tiempo plataforma bloqueada por mucho tiempo
    timerAvailableAwaitCar:{    cmd:7,args:[15]},   //Tiempo para garantizar el segundo llamado
    timerAvailable:{            cmd:8,args:[5]},   //Tiempo para garantizar el segundo llamado
}
const BuildingTypes = {
    ID_CENTRAL          :0,
    ID_MASTER_READER    :1,
    ID_REMOTE_READER    :2,
    ID_UHF_READER       :3,
    ID_LIFT_READER      :4,
    ID_ON_OFF_CONTROL   :5,
}
module.exports = {
    commands  ,request, config, BuildingTypes
}