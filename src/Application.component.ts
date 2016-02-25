declare var angular;
class View {
    constructor(public $mdDialog, public $mdToast) {
        if (typeof(Storage) !== "undefined") {
            this.timers = JSON.parse(localStorage.getItem("lykro.timers")) || [];
        }
        // save loop
        setInterval(() => {
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("lykro.timers", JSON.stringify(this.timers));
            }
        }, 1000)
    }

    private timers:any[];

    private addPostIt() {
        this.timers.push({
            id: Date.now(),
            title: "",
            description: "",
            value: 0,
            color: "E2E0DD"
        });
    }

    private deletePostIt(index) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = this.$mdDialog.confirm()
            .title('Remove Post-It')
            .textContent('Are you sure you want to remove this Post-It ?')
            .ok('Yes')
            .cancel('No');
        this.$mdDialog.show(confirm).then(
            () => {
                this.timers.splice(index, 1);
                this.$mdToast.show(this.$mdToast.simple().textContent("Post-It successfully removed"));
            },
            () => {
                this.$mdToast.show(this.$mdToast.simple().textContent("Post-It was not removed"));
            }
        );
    }

    private deleteAllPostIt() {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = this.$mdDialog.confirm()
            .title('Remove Post-It')
            .textContent('Are you sure you want to remove ALL Post-It ?')
            .ok('Yes')
            .cancel('No');
        this.$mdDialog.show(confirm).then(
            () => {
                this.timers = [];
                this.$mdToast.show(this.$mdToast.simple().textContent("All Post-It successfully removed"));
            },
            () => {
                this.$mdToast.show(this.$mdToast.simple().textContent("No Post-It was removed"));
            }
        );
    }

    private exportToCsv() {
        let csv = "Client;Description;Time\r\n";
        this.timers.forEach(timer => {
            csv += "\"" + timer.title + "\";\"" + timer.description + "\";" + Timer.getDisplayValue(timer.value) + "\r\n";
        });

        var uint8 = new Uint8Array(csv.length);
        for (var i = 0; i <  uint8.length; i++){
            uint8[i] = csv.charCodeAt(i);
        }

        let blob = new Blob([uint8], {type: 'text/csv'});
        let elem:any = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = "timers.csv";
        document.body.appendChild(elem)
        elem.click();
        document.body.removeChild(elem);
    }

    private getTotalTime() {
        return Timer.getDisplayValue(this.timers.reduce((result, t) => {return result + t.value}, 0));
    }
}
angular.module('Application', ['ngMaterial', 'ngSanitize'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('red');
    })
    .component("view", {
        template: `<style> .fabButtonIcon {
    font-size: 35px;
    margin-top: 10px
}

.fabButtonIcon {
    font-size: 24px;
    margin-top: 8px
}
</style>
<div layout="column">
    <md-toolbar class="md-whiteframe-4dp" layout="row" layout-align="start center">
        <div>&nbsp;</div>
        <i style="font-size: 30px" class="material-icons">av_timer</i>
        <div>
            <span style="font-family: 'Verdana';font-size: 25px;font-weight: bolder">&nbsp;LYKRO</span>
            <span style="font-family: 'GoudyBookletter1911';font-size: 20px;font-style: italic">for Lawyers&nbsp;&nbsp;&nbsp;</span>
        </div>

        <md-button class="md-fab md-mini md-primary md-hue-2" ng-click="$ctrl.deleteAllPostIt()"
                   aria-label="Clear all Post-It">
            <i class="material-icons fabButtonIcon">delete_forever</i>
            <md-tooltip>
                Clear all Post-It
            </md-tooltip>
        </md-button>

        <md-button class="md-fab md-mini md-primary md-hue-2" ng-click="$ctrl.exportToCsv()"
                   aria-label="Export to Excel">
            <i class="material-icons fabButtonIcon">view_list</i>
            <md-tooltip>
                Export to Excel
            </md-tooltip>
        </md-button>
        <md-button class="md-fab md-mini md-primary md-hue-2" ng-click="$ctrl.addPostIt()" aria-label="Add post-it">
            <i class="material-icons fabButtonIcon">add</i>
            <md-tooltip>
                Add post-it
            </md-tooltip>
        </md-button>

        <div flex></div>

        <span style="font-family: 'Verdana';font-size: 25px;font-weight: bolder">Total time : {{$ctrl.getTotalTime()}}&nbsp;</span>
    </md-toolbar>

    <div layout="row">
    </div>
    <div layout="row" layout-wrap>
        <timer ng-repeat="timer in $ctrl.timers"
               id="timer.id"
               title="timer.title"
               description="timer.description"
               value="timer.value"
               color="timer.color"
               on-delete="$ctrl.deletePostIt($index)"></timer>
    </div>
</div>`,
        controller: View
    });