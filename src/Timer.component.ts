declare var angular;

class Timer {
    constructor(private $scope, private $mdDialog) {
        this.color = this.color || "E5CF33";
    }

    private id: number;
    private value: number;
    private _title: string;
    private color: string;
    private description: string;
    private _displayValue: string = Timer.getDisplayValue(this.value);
    private fullCount: number = this.value;
    private intervalId: any;

    private get title() {
        return this._title && this._title.toUpperCase();
    }
    private set title(value: string) {
        if (value !== this._title) {
            this._title = value.toUpperCase();
        }
    }

    private get displayValue() {
        return this._displayValue;
    }
    private set displayValue(value: string) {
        if (value !== this._displayValue) {
            // also update value
            if (!this.isStarted()) {
                let newValue = Timer.getValue(value);
                if (!isNaN(newValue) && newValue !== this.value) {
                    this._displayValue = value;
                    this.value = newValue;
                    this.fullCount = newValue;
                }
            } else {
                this._displayValue = value;
            }
        }
    }

    // if the timer is running, this is the timestamp corresponding to the start time,
    // else this should be undefined
    private startTimestamp: number;

    private start(): void {
        if (!this.isStarted()) {
            this.startTimestamp = Date.now();
            this.intervalId = setInterval(() => {
                this.$scope.$apply(() => {
                    var test = this.title;
                    this.value = this.fullCount + (Date.now() - this.startTimestamp);
                    this.displayValue = Timer.getDisplayValue(this.value);
                })
            }, 1);
        }
    }

    private stop(): void {
        if (this.isStarted()) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.fullCount = this.value;
            this.startTimestamp = undefined;
        }
    }

    private isStarted(): boolean {
        return this.startTimestamp !== undefined;
    }

    private actionIcon(): string {
        return this.isStarted() ? "pause_circle_outline" : "play_circle_outline";
    }

    private openMenu($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    public static getDisplayValue(value: number): string {
        let time = Math.round(value / 1000);
        let seconds = time % 60; time = Math.floor(time / 60);
        let minutes = time % 60; time = Math.floor(time / 60);
        let hours = time;

        return (hours < 10 ? "0" + hours : hours) + ":" +
            (minutes < 10  ? "0" + minutes : minutes) + ":" +
            (seconds < 10  ? "0" + seconds : seconds);
    }

    public static getValue(displayValue: string): number {
        let result = NaN;
        let tokens = displayValue.split(":");
        if (tokens.length === 3 && Timer.isNumber(tokens[0]) && Timer.isNumber(tokens[1]) && Timer.isNumber(tokens[2])) {
            result = (parseInt(tokens[0]) * 3600000) + (parseInt(tokens[1]) * 60000) + (parseInt(tokens[2]) * 1000);
        }
        return result;
    }

    public static isNumber(numberString: string): boolean {
        let result = true;
        for(let i = 0, max = numberString.length; i < max; i ++) {
            if (isNaN(parseInt(numberString[i]))) {
                result = false;
            }
        }
        return result;
    }
}

angular.module("Application").component("timer", {
    bindings: {
        id: "=",
        value: "=",
        title: "=",
        description: "=",
        color: "=",
        onDelete: "&"
    },
    template: `<style>

    .timer{{$ctrl.id}} {
        display: inline-block;
        position: relative;
        width: 250px;
        height: 200px;
        background: #aaa;
        margin: 10px;
        padding: 0;
        background: #{{$ctrl.color}};
        //background: -webkit-gradient(linear, left bottom, left top, from(#{{$ctrl.color}}), to(#{{$ctrl.color}}));
        -webkit-border-radius: 10px;
        -webkit-user-select: none;
    }

    .timer{{$ctrl.id}}:before{
        content: "";
        position: absolute;
        right: 0px;
        border-style: solid;
        height: 0px;
        width: 0px;
        display: block;
        -webkit-box-shadow: 0pt 2px 1px rgba(0, 0, 0, 0.2), -2px 1px 1px rgba(0, 0, 0, 0.1);
        -webkit-border-radius: 0pt 0pt 0pt 5px;
        border-color: #FFFFFF #FFFFFF #{{$ctrl.color}} #{{$ctrl.color}};
        border-width: 10px;
        -webkit-user-select: none;
    }

    .header {
        display: inline-block;
        height: 24px;
        width: 250px;
        padding: 0px;
        margin: 0px;
        -webkit-user-select: none;
    }

    .body {
        display: inline-block;
        height: 110px;
        width: 250px;
        padding: 0px;
        margin: 0px;
        -webkit-user-select: none;
    }

    .footer {
        height: 24px;
        width: 250px;
        padding: 0px 0px 0px 10px;
        margin: 0px;
        -webkit-user-select: none;
    }

    .titleContainer {
        padding: 0px 0px 0px 10px;
        margin: 0px 0px 0px 0px;
        width: 190px;
        height: 24px;
        float: left;
    }

    .title {
        font-size: 17px;
        font-family: Calibri;
        font-weight: bolder;
    }

    .descriptionContainer {
        width: 230px;
        padding: 0px 0px 0px 10px;
        margin: 10px 0px 0px 0px;
    }

    .description {
        font-family: Calibri;
        font-size: 16px;
        line-height: 16px !important;
        height: 116px !important;
        overflow: initial;
    }

    .timeContainer {
        float: left;
        pointer: default;
        width: 160px;
        padding-left: 10px;
        -webkit-user-select: none;
    }

    .time {
        font-family: "Calibri";
        font-size: 23px;
        font-weight: bolder;
    }

    .actionIcon {
        cursor:pointer;
        font-size:40px;
        height: 24px;
        padding: 0px;
        margin: 0px;
        position: absolute;
        bottom: 20px;
        -webkit-user-select: none;
    }

    .deleteIcon {
        float: left;
        margin-top: 2px;
        cursor:pointer;
    }

    .paletteIcon {
        float: left;
        margin-top: 2px;
        cursor:pointer;
    }
</style>
<div class="timer{{$ctrl.id}}">

    <div class="header">

        <md-input-container md-no-float class="md-block titleContainer">
            <input class="title" ng-model="$ctrl.title" placeholder="Client name" style="-webkit-text-fill-color: black;">
        </md-input-container>

        <md-menu>
            <i class="material-icons paletteIcon" ng-click="$ctrl.openMenu($mdOpenMenu, $event)">palette</i>

            <md-menu-content width="0">
                <md-menu-item>
                    <md-subheader style="font-family: Calibri;font-weight: bolder;font-size: 16px;-webkit-user-select: none;">Chooose color</md-subheader>
                </md-menu-item>
                <md-menu-item>
                    <div layout="row">
                        <i class="material-icons" style="color: #FFA116;cursor:pointer;" ng-click="$ctrl.color='FFA116'">lens</i>
                        <i class="material-icons" style="color: #DDA0DD;cursor:pointer;" ng-click="$ctrl.color='DDA0DD'">lens</i>
                        <i class="material-icons" style="color: #FFDEAD;cursor:pointer;" ng-click="$ctrl.color='FFDEAD'">lens</i>
                        <i class="material-icons" style="color: #FD7F26;cursor:pointer;" ng-click="$ctrl.color='FD7F26'">lens</i>
                        <i class="material-icons" style="color: #B0E0E6;cursor:pointer;" ng-click="$ctrl.color='B0E0E6'">lens</i>
                    </div>
                </md-menu-item>

                <md-menu-item>
                    <div layout="row">

                        <i class="material-icons" style="color: #E6E6FA;cursor:pointer;" ng-click="$ctrl.color='E6E6FA'">lens</i>
                        <i class="material-icons" style="color: #9ACD32;cursor:pointer;" ng-click="$ctrl.color='9ACD32'">lens</i>
                        <i class="material-icons" style="color: #E64545;cursor:pointer;" ng-click="$ctrl.color='E64545'">lens</i>
                        <i class="material-icons" style="color: #6495ED;cursor:pointer;" ng-click="$ctrl.color='6495ED'">lens</i>
                        <i class="material-icons" style="color: #FFD700;cursor:pointer;" ng-click="$ctrl.color='FFD700'">lens</i>
                    </div>
                </md-menu-item>

                <md-menu-item>
                    <div layout="row">

                        <i class="material-icons" style="color: #DB7093;cursor:pointer;" ng-click="$ctrl.color='DB7093'">lens</i>
                        <i class="material-icons" style="color: #27B7E2;cursor:pointer;" ng-click="$ctrl.color='27B7E2'">lens</i>
                        <i class="material-icons" style="color: #E2E0DD;cursor:pointer;" ng-click="$ctrl.color='E2E0DD'">lens</i>
                        <i class="material-icons" style="color: #DE52CD;cursor:pointer;" ng-click="$ctrl.color='DE52CD'">lens</i>
                    </div>
                </md-menu-item>
            </md-menu-content>
        </md-menu>

    </div>

    <div class="body">
        <md-input-container md-no-float class="md-block descriptionContainer">
            <textarea class="description" md-no-autogrow ng-model="$ctrl.description" placeholder="Task Description" style="-webkit-text-fill-color: black;" rows="4"></textarea>
        </md-input-container>
    </div>

    <div class="footer">
        <i class="material-icons deleteIcon" ng-click="$ctrl.onDelete()" style="margin-top: 23px;">remove_circle_outline</i>
        <md-input-container md-no-float class="md-block timeContainer">
            <input class="time" ng-disabled="$ctrl.isStarted()" ng-model="$ctrl.displayValue" ng-model-options="{updateOn : 'change blur'}" placeholder="Time" style="-webkit-text-fill-color: black;border-color: transparent;width:100px">
        </md-input-container>
        <i class="material-icons actionIcon" ng-click="$ctrl.isStarted() ? $ctrl.stop() : $ctrl.start()">
            {{$ctrl.actionIcon()}}
        </i>
    </div>
</div>`,
    controller: Timer
});