angular.module('ShinyaNews.timeMachineDirective', [])
.directive('syNewsTimeMachine', function (){
    return {
        restrict: 'E',
        template: '
            <div>
                <div ng-if="isShowTimeMachine" ng-click="toggleTimeMachine()" class="timeMachine animate--faster">
                    <div class="vertically_center">
                        <div class="timeMachine__inner">
                            <form novalidate ng-submit="timeMachineSelectNews()" name="form" sy-news-stop-propagation>
                                <div ng-if="!isOldNews">
                                    <input sy-news-autofocus type="number" placeholder="H" ng-model="timeMachineInfo.H" class="animate--faster" min="1" max="24" required>:
                                    <input type="number" placeholder="00" disabled>
                                </div>
                                <div ng-if="isOldNews">
                                    <input type="number" placeholder="Y" ng-model="timeMachineInfo.Y" min="15" max="16" required>-
                                    <input type="number" placeholder="M" ng-model="timeMachineInfo.M" class="animate--faster" min="1" max="12" required>-
                                    <input sy-news-autofocus type="number" placeholder="D" ng-model="timeMachineInfo.D" class="animate--faster" min="1" max="31" required>
                                </div>
                            </form>
                            <div sy-news-stop-propagation>
                                <svg ng-click="timeMachineSelectNews(-1)" class="timeMachine__button timeMachine__button--fillTRI float--left" viewBox="0 0 208 208" xmlns="http://www.w3.org/2000/svg">
                                    <g fill="#FFF" stroke="#000" stroke-width="7">
                                        <circle cx="104" cy="104" r="100"/>
                                        <g stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M97.489 59l-44.489 44.567 44.489 44.567"/>
                                            <path class="animate--faster" d="M135 149v-89.135l-49.723 44.567 49.723 44.567z"/>
                                        </g>
                                    </g>
                                </svg>
                                <svg ng-click="timeMachineSelectNews()" class="timeMachine__button timeMachine__button--fillBG" ng-class="{\'timeMachine__button--invalid\': form.$invalid}" viewBox="0 0 208 208" xmlns="http://www.w3.org/2000/svg" >
                                    <g class="animate--faster" fill="#FFF" stroke="#000" stroke-width="7">
                                        <circle stroke="#000" cx="104" cy="104" r="100"/>
                                        <g class="animate--faster" stroke="#000" stroke-linecap="round">
                                            <path d="M82 146l70.711-70.711"/>
                                            <path d="M82 146l-25.456-25.456"/>
                                        </g>
                                    </g>
                                </svg>
                                <svg ng-click="toggleTimeMachine()" class="timeMachine__button timeMachine__button--fillBG" viewBox="0 0 208 208" xmlns="http://www.w3.org/2000/svg">
                                    <g class="animate--faster" fill="#FFF" stroke="#000" stroke-width="7">
                                        <circle storke="#000" cx="104" cy="104" r="100"/>
                                        <g class="animate--faster" stroke="#000" stroke-linecap="round">
                                            <path d="M76.427 132.987l56.56-56.56"/>
                                            <path d="M132.284 132.284l-56.569-56.569"/>
                                        </g>
                                    </g>
                                </svg>
                                <svg ng-click="timeMachineSelectNews(1)" class="timeMachine__button timeMachine__button--fillTRI float--right" viewBox="0 0 208 208" xmlns="http://www.w3.org/2000/svg">
                                    <g fill="#FFF" stroke="#000" stroke-width="7">
                                        <circle cx="104" cy="104" r="100"/>
                                        <g stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M111.511 59l44.489 44.567-44.489 44.567"/>
                                            <path class="animate--faster" d="M74 149v-89.135l49.723 44.567-49.723 44.567z"/>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <svg ng-click="toggleTimeMachine()" class="toolBar__button--timeMachine animate--faster" viewBox="0 0 214 214" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(7 7)" fill="none">
                        <circle class="animate--faster" stroke="#CECECF" stroke-width="7" cx="100" cy="100" r="100"/>
                        <g class="animate--faster" transform="translate(26 25)" fill="#CECECF">
                            <circle cx="74.5" cy="75.5" r="18.5"/>
                            <circle cx="130.5" cy="75.5" r="18.5"/>
                            <circle cx="18.5" cy="75.5" r="18.5"/>
                            <circle cx="74.5" cy="19.5" r="18.5"/>
                            <circle cx="74.5" cy="131.5" r="18.5"/>
                        </g>
                    </g>
                </svg>
            </div>
        ',
        controller: ['$scope', function ($scope){
            $scope.toggleTimeMachine = function (){
                $scope.timeMachineInfo = {
                    Y: new Date($scope.selectOldNewsInfo.selectDate).getFullYear() % 2000,
                    M: new Date($scope.selectOldNewsInfo.selectDate).getMonth() + 1,
                    D: new Date($scope.selectOldNewsInfo.selectDate).getDate(),
                    H: new Date($scope.selectNewsInfo.selectDate).getHours()
                }
                $scope.isShowTimeMachine = !$scope.isShowTimeMachine
            }
        }]
    }
})