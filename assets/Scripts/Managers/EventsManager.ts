import { _decorator, CCInteger, Component, Node } from 'cc';
import { EventTarget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EventsManager')
export class EventsManager extends Component {
    public static instance: EventsManager | null = null;

    public readonly events = new EventTarget();
    public static readonly EVENT_ON_SHOW_GUIDES_POPUP = "show-guides-popup";

    protected onLoad() {
        if (EventsManager.instance && EventsManager.instance !== this) {
            this.node.destroy();
            return;
        }

        EventsManager.instance = this;
    }

    protected onDestroy() {
        if (EventsManager.instance === this) {
            EventsManager.instance = null;
        }
    }
}


