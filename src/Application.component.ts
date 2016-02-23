declare var angular;
class View {
    constructor(public $mdDialog, public $mdToast) {
        if(typeof(Storage) !== "undefined") {
            this.timers = JSON.parse(localStorage.getItem("lykro.timers")) || [];
        }
        // save loop
        setInterval(() => {
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem("lykro.timers", JSON.stringify(this.timers));
            }
        }, 1000)
    }

    private timers: any[];

    private addPostIt() {
        this.timers.push({
            id: Date.now(),
            title: "Enter client name",
            description: "Enter your task description here",
            value: 0,
            color: "FFD700"});
    }

    private deletePostIt(index) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = this.$mdDialog.confirm()
            .title('Remove Post-It')
            .textContent('Are you sure you want to remove this Post-It ?')
            .ok('Yes')
            .cancel('No');
        this.$mdDialog.show(confirm).then(
            () => { this.timers.splice(index, 1); this.$mdToast.show(this.$mdToast.simple().textContent("Post-It successfully removed")); },
            () => { this.$mdToast.show(this.$mdToast.simple().textContent("Post-It was not removed")); }
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
            () => { this.timers = []; this.$mdToast.show(this.$mdToast.simple().textContent("All Post-It successfully removed")); },
            () => { this.$mdToast.show(this.$mdToast.simple().textContent("No Post-It was removed")); }
        );
    }

    private exportToCsv() {
        let csv = "Client;Description;Time\r\n";
        this.timers.forEach(timer => {
            csv += "\"" + timer.title + "\";\"" + timer.description + "\";" + Timer.getDisplayValue(timer.value) + "\r\n";
        });

        let blob = new Blob([csv], {type: 'text/csv'});
        let elem: any = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = "timers.csv";
        document.body.appendChild(elem)
        elem.click();
        document.body.removeChild(elem);
    }
}
angular.module('Application', ['ngMaterial', 'ngSanitize'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('red');
    })
    .component("view", {
    template: `<div layout="column">
    <md-toolbar class="md-whiteframe-4dp" layout="row" layout-align="start center">
        <div>&nbsp;</div>
        <i style="font-size: 30px" class="material-icons">av_timer</i>
        <div style="font-family: 'Verdana';font-weight: bolder">&nbsp;LYKRO&nbsp;</div>
        <md-button class="md-raised" ng-click="$ctrl.addPostIt()">Add post-it</md-button>
        <md-button class="md-raised" ng-click="$ctrl.deleteAllPostIt()">Clear all Post-It</md-button>
        <md-button class="md-raised" ng-click="$ctrl.exportToCsv()">Export to Excel</md-button>
    </md-toolbar>
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