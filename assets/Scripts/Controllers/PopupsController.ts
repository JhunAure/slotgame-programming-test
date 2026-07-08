import { __private, _decorator, Button, Component, instantiate, Node, Prefab } from 'cc';
import { EventTarget } from 'cc';
import { GuidesPopup } from '../Popups/GuidesPopup';
import { EventsManager } from '../Managers/EventsManager';

const { ccclass, property } = _decorator;

@ccclass('PopupsController')
export class PopupsController extends Component {
    @property(Prefab) guidesPopup: Prefab;

    protected onLoad() {
        EventsManager.instance.events.on(EventsManager.EVENT_ON_SHOW_GUIDES_POPUP, this.onShowGuidesPopup, this)
    }

    protected onDisable() {
        EventsManager.instance.events.off(EventsManager.EVENT_ON_SHOW_GUIDES_POPUP, this.onShowGuidesPopup, this)
    }
    
    private onShowGuidesPopup() {
        var guidesPopup = instantiate(this.guidesPopup);
        guidesPopup.parent = this.node;
    }
}


