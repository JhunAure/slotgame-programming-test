import { __private, _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GuidesPopup')
export class GuidesPopup extends Component {
    @property(Button) closeButton: Button;

    protected onLoad() {
        this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonPressed, this)
    }

    protected onDisable() {
        this.closeButton.node.off(Button.EventType.CLICK, this.onCloseButtonPressed, this)
    }

    private onCloseButtonPressed() {
        this.node.destroy();
    }
}


