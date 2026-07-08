import { _decorator, Animation, Color, Component, math, Node, Sprite } from 'cc';
import { SlotmachineManager, SpinResult } from '../Managers/SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('PaylineHUDItem')
export class PaylineHUDItem extends Component {
    @property(Sprite) private sprite: Sprite;
    @property(Animation) private animation: Animation;

    public startAnimation(){
        this.setState(true);
        this.animation.play("symbol_match");
    }

    public stopAnimation(){
        this.setState(false);
        this.animation.stop();
    }

    private setState(enable: boolean){
        this.sprite.grayscale = !enable;
        this.sprite.color = new Color(255, 255, 255, enable? 255: 150);
    }
}


