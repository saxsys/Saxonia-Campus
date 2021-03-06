/* 
 *This QUnit Tests test the REST-API of the Campus Application.
 */

var createdSlot = undefined;

module("API");

asyncTest("Testen der Authentisierung.", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";

    var auth_success = function(data) {
        ok(true, "Authentication successfull");
        notEqual(data, undefined, "data ist nicht undefined");
        notEqual(saxoniaCampusRestApi.CURRENT_USER_URL, "", "currentUser URL ist definiert");
        notEqual(saxoniaCampusRestApi.SLOTS_URL, "", "slots URL ist definiert");
        notEqual(data, undefined, "data ist nicht undefined");
        start();
    };
    var auth_fail = function() {
        ok(false, "Authentication failed");
        start();
    };

    saxoniaCampusRestApi.authenticate(auth_success, auth_fail);
});

asyncTest("Teste getCurrentUser", function() {
    var expectedUsername = "marco.dierenfeldt";
    var expectedRole = "ADMIN";

    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.authenticate(function() {
        var onSuccess = function(data) {
            ok(true, "getCurrentUser successfull");
            equal(data.role, expectedRole, "Erwartete Rolle ADMIN");
            equal(data.username, expectedUsername, "Erwarteter Username marco.dierenfeldt");
            start();
        };
        var onFail = function() {
            ok(false, "getCurrentUser failed");
            start();
        };

        saxoniaCampusRestApi.getCurrentUser(onSuccess, onFail);
    },
            function() {
            });
});

asyncTest("Teste getSlots", function() {
    var expectedSlotslength = 20;
    var expectedRoomsUrl = "http://" + location.host + "/rest/rooms";

    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.authenticate(function() {
        var onSuccess = function(slots) {
            ok(true, "getSlots successfull");
            equal(slots.length, expectedSlotslength, "Es werden 20 Slots zurückgeliefert.")
            notEqual(saxoniaCampusRestApi.ROOMS_URL, undefined, "ROOMS_URL ist definiert.");
            equal(saxoniaCampusRestApi.ROOMS_URL, expectedRoomsUrl, "Rooms Url http://HOSTNAME:PORT/rest/romms");
            start();
        };
        var onFail = function() {
            ok(false, "getSlots failed");
            start();
        };

        saxoniaCampusRestApi.getSlots(onSuccess, onFail);
    },
            function() {
            });
});

asyncTest("Teste getRooms", function() {
    var expectedRoomslength = 2;

    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.authenticate(function() {
        saxoniaCampusRestApi.getSlots(function() {
            var onSuccess = function(rooms) {
                ok(true, "getRooms successfull");
                equal(rooms.length, expectedRoomslength, "Es wird erwartet, dass zwei Räume zurückgegeben werden.")
                start();
            };
            var onFail = function() {
                ok(false, "getRooms failed");
                start();
            };

            saxoniaCampusRestApi.getRooms(onSuccess, onFail);
        }, function() {
        });
    },
            function() {
            });
});

asyncTest("Anlegen eines neuen Slots", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    var slot = {
        "capacity": 8,
        "description": "Neuer Slot",
        "endtime": 34200000,
        "speaker": "Marco Dierenfeldt",
        "starttime": 30600000,
        "title": "Neues Thema 1",
        "room": 1
    };
    saxoniaCampusRestApi.authenticate(function() {
        var onSuccess = function(data) {
            ok(true, "addSlot successfull");
            console.log(data);
            createdSlot = JSON.parse(data.responseText);
            console.log(createdSlot);
            start();
        };
        var onFail = function(err) {
            ok(false, "addSlot failed");
            console.log(err);
            start();
        };

        saxoniaCampusRestApi.addSlot(slot, onSuccess, onFail);
    }, function() {
    });
});

asyncTest("Löschen eines Slots", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    if (createdSlot !== undefined) {
        var onSuccess = function(data) {
            ok(true, "delete slot successfull");
            console.log(data);
            start();
        };
        var onFail = function(err) {
            ok(false, "delete slot failed");
            console.log(err);
            start();
        };

        saxoniaCampusRestApi.deleteSlot(createdSlot, onSuccess, onFail);
    } else {
        ok(false, "Kein slot generiert. createdSlot == undefined");
        start();
    }
});

asyncTest("Auflisten der Teilnehmer eines Slots", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.SLOTS_URL = saxoniaCampusRestApi.BASE_URL + "slots";
    var dummySlot ={id:1};
    var expectedParticipantCount = 3;
    
    var onSuccess = function(data) {
            ok(true, "getParticipants successfull");
            console.log(data);
            equal(data.length,expectedParticipantCount,"Es wird ein Array mit 3 Teilnehmern erwartet.");
            start();
        };
        var onFail = function(err) {
            ok(false, "getParticipants failed");
            console.log(err);
            start();
        };

        saxoniaCampusRestApi.getParticipants(dummySlot, onSuccess, onFail);
});    

asyncTest("Hinzufügen eines Teilnehmers zu einem Slot", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.SLOTS_URL = saxoniaCampusRestApi.BASE_URL + "slots";
    var dummySlot ={id:2};
    var expectedParticipantCount = 1;
    
    var onSuccess = function(data) {
            ok(true, "addParticipants successfull");
            console.log(data);
            var slot = createdSlot = JSON.parse(data.responseText);
            equal(slot.participants,expectedParticipantCount, "Nach hinzufügen ein Teilnemer im Slot");
            start();
        };
        var onFail = function(err) {
            ok(false, "addParticipants failed");
            console.log(err);
            start();
        };

        saxoniaCampusRestApi.addParticipant(dummySlot, onSuccess, onFail);
});    

asyncTest("Löschen eines Teilnehmers aus einem Slot", function() {
    saxoniaCampusRestApi.AUTH_STRING = "Basic bWFyY28uZGllcmVuZmVsZHQ6Y2FtcHVz";
    saxoniaCampusRestApi.SLOTS_URL = saxoniaCampusRestApi.BASE_URL + "slots";
    var dummySlot ={id:2};
    var expectedParticipantCount = 0;
    
    var onSuccess = function(data) {
            ok(true, "delParticipant successfull");
            console.log(data);
            var slot = createdSlot = JSON.parse(data.responseText);
            equal(slot.participants,expectedParticipantCount, "Nach hinzufügen ein Teilnemer im Slot");
            start();
        };
        var onFail = function(err) {
            ok(false, "delParticipant failed");
            console.log(err);
            start();
        };

        saxoniaCampusRestApi.delParticipant(dummySlot, onSuccess, onFail);
});    