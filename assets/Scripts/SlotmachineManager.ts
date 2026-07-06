import { _decorator, Component } from "cc";

const { ccclass, property } = _decorator;

@ccclass('SlotmachineManager')
export class SlotmachineManager extends Component
{
    @property private spinSpeed = 1500;
    @property private deceleration = 100;
    @property private minStoppingSpeed = 200;

    public static instance: SlotmachineManager;

    protected onLoad()
    {
        SlotmachineManager.instance = this;
    }

    public getSpinSpeed(): number {return this.spinSpeed;}
    public getDeceleration(): number {return this.deceleration;}
    public getMinStoppingSpeed(): number {return this.minStoppingSpeed;}
}