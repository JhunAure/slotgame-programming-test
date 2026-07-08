import { _decorator, CCInteger, Component, Node } from 'cc';
import { EventTarget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData {
    @property(CCInteger) balance: number;
}

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(PlayerData) playerData: PlayerData = new PlayerData();
    @property(CCInteger) balanceTopUpValue = 50;

    public static instance: PlayerManager | null = null;

    public readonly events = new EventTarget();
    public static readonly EVENT_ON_BALANCE_UPDATE = "spin-complete";

    protected onLoad() {
        if (PlayerManager.instance && PlayerManager.instance !== this) {
            this.node.destroy();
            return;
        }

        PlayerManager.instance = this;
    }

    protected onDestroy() {
        if (PlayerManager.instance === this) {
            PlayerManager.instance = null;
        }
    }

    protected start() {

    }

    public topup() {
        this.increaseBalance(this.balanceTopUpValue);
    }

    public getCurrentBalance(): number {
        return this.playerData.balance;
    }

    public increaseBalance(amount: number) {
        const prevBalance = this.playerData.balance;

        this.playerData.balance += amount;
        this.events.emit(PlayerManager.EVENT_ON_BALANCE_UPDATE, this.playerData.balance);

        console.log(`[BALANCE] +${amount} | ${prevBalance} → ${this.playerData.balance}`);
    }

    public deductBalance(amount: number) {
        const prevBalance = this.playerData.balance;

        this.playerData.balance = Math.max(this.playerData.balance - amount, 0);
        this.events.emit(PlayerManager.EVENT_ON_BALANCE_UPDATE, this.playerData.balance);

        console.log(`[BALANCE] -${amount} | ${prevBalance} → ${this.playerData.balance}`);
    }

    public hasEnoughBalance(amount: number): boolean {
        return this.playerData.balance >= amount;
    }
}


