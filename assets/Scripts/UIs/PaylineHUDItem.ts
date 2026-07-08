import { _decorator, Animation, Color, Component, math, Node, Sprite, Label } from 'cc';
import { SlotmachineManager, SpinResult } from '../Managers/SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('PaylineHUDItem')
export class PaylineHUDItem extends Component {
    @property(Sprite) private sprite: Sprite;
    @property(Animation) private animation: Animation;
    @property(Label) private winAmountLabel: Label;

    public show(winAmount: number){
        this.winAmountLabel.string = "+"+winAmount.toString();
        this.setState(true);
        this.animation.play("symbol_match");
    }

    public hide(){
        this.setState(false);
        this.animation.stop();
        this.winAmountLabel.string = "";
    }

    private setState(enable: boolean){
        this.node.active = enable;
    }
}


