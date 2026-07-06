import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Symbol')
export class Symbol extends Component 
{
    private index: number;
    
    protected start() 
    {

    }

    public initialize(index: number) 
    {
        this.index = index;
    }
}


