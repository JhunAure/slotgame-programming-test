import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Symbol')
export class Symbol extends Component 
{
    @property(UITransform) transform : UITransform;

    private index: number;
    
    protected start() 
    {

    }

    public initialize(index: number) 
    {
        this.index = index;
    }

    public getHeight(): number {
        return this.transform.height;
    }
}


