import { _decorator, Component, Node, Sprite, UITransform, Vec3, Animation } from 'cc';
import { SymbolData } from '../Managers/SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('Symbol')
export class Symbol extends Component {
    @property(UITransform) private transform: UITransform;
    @property(Sprite) private sprite: Sprite;
    @property(Animation) private animation: Animation;

    private index: number;

    protected start() {

    }

    public initialize(index: number) {
        this.index = index;
    }

    public setData(data: SymbolData) {
        this.sprite.spriteFrame = data.texture;
    }

    public getHeight(): number {
        return this.transform.height;
    }

    public playMatchAnimation(onFinished?: () => void) {
        if (onFinished) {
            this.animation.once(Animation.EventType.FINISHED, onFinished);
        }

        this.animation.play("node_scale_bounce");
    }

    public stopMatchAnimation()
    {

    }

    public setGrayscale(enable: boolean) {
        const material = this.sprite.material;

        if (enable) {
            this.sprite.grayscale = true;
        }
        else {
            this.sprite.grayscale = false;
        }
    }
}


