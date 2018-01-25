'use strict';


(function() {

    // Provides utility methods for connecting to mixer services

    angular
        .module('firebotApp')
        .factory('connectionManager', function (connectionService, listenerService, settingsService, websocketService,
            soundService) {

            let service = {};

            service.isWaitingForServicesStatusChange = function() {
                return (connectionService.waitingForStatusChange || connectionService.waitingForChatStatusChange ||
                    connectionService.isConnectingAll);
            };

            service.setConnectionToChat = function(shouldConnect) {
                return new Promise(resolve => {
                    listenerService.registerListener(
                        { type: listenerService.ListenerType.CHAT_CONNECTION_STATUS,
                            runOnce: true },
                        (isChatConnected) => {
                            resolve(isChatConnected);
                        });

                    if (shouldConnect) {
                        connectionService.connectToChat();
                    } else {
                        connectionService.disconnectFromChat();
                    }
                });
            };

            service.setConnectionToInteractive = function(shouldConnect) {
                return new Promise(resolve => {
                    listenerService.registerListener(
                        { type: listenerService.ListenerType.CONNECTION_STATUS,
                            runOnce: true },
                        (isInteractiveConnected) => {
                            resolve(isInteractiveConnected);
                        });

                    if (shouldConnect) {
                        connectionService.connectToInteractive();
                    } else {
                        connectionService.disconnectFromInteractive();
                    }

                });
            };

            service.connectedServiceCount = function() {
                let services = settingsService.getSidebarControlledServices();

                let count = 0;

                services.forEach((s) => {
                    switch (s) {
                    case 'interactive':
                        if (connectionService.connectedToInteractive) {
                            count++;
                        }
                        break;
                    case 'chat':
                        if (connectionService.connectedToChat) {
                            count++;
                        }
                        break;
                    }
                });

                return count;
            };

            service.partialServicesConnected = function() {
                let services = settingsService.getSidebarControlledServices();
                let connectedCount = service.connectedServiceCount();

                return (connectedCount > 0 && services.length > connectedCount);
            };

            service.allServicesConnected = function() {
                let services = settingsService.getSidebarControlledServices();
                let connectedCount = service.connectedServiceCount();

                return (services.length === connectedCount);
            };

            service.toggleSidebarServices = async function () {
                let services = settingsService.getSidebarControlledServices();

                // we only want to connect if none of the connections are currently connected
                // otherwise we will attempt to disconnect everything.

                let shouldConnect = service.connectedServiceCount() === 0;

                connectionService.isConnectingAll = true;
                for (let i = 0; i < services.length; i++) {
                    let s = services[i];
                    switch (s) {
                    case 'interactive': {
                        if (shouldConnect) {
                            await service.setConnectionToInteractive(true);
                        } else if (connectionService.connectedToInteractive) {
                            await service.setConnectionToInteractive(false);
                        }
                        break;
                    }
                    case 'chat':
                        if (shouldConnect) {
                            await service.setConnectionToChat(true);
                        } else if (connectionService.connectedToChat) {
                            await service.setConnectionToChat(false);
                        }
                        break;
                    }
                }
                connectionService.isConnectingAll = false;

                let soundType = service.connectedServiceCount() > 0 ? "Online" : "Offline";
                soundService.connectSound(soundType);
            };

            service.getConnectionStatusForService = function(service) {
                let connectionStatus = null;
                switch (service) {
                case "interactive":
                    if (connectionService.connectedToInteractive) {
                        connectionStatus = "connected";
                    } else {
                        connectionStatus = "disconnected";
                    }
                    break;
                case "chat":
                    if (connectionService.connectedToChat) {
                        connectionStatus = "connected";
                    } else {
                        connectionStatus = "disconnected";
                    }
                    break;
                case "overlay":
                    if (websocketService.hasClientsConnected) {
                        connectionStatus = "connected";
                    } else {
                        connectionStatus = "warning";
                    }
                    break;
                }
                return connectionStatus;
            };

            return service;
        });
}(window.angular));