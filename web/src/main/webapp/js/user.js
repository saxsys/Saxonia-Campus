/*
 * Controller javascript für die User-View
 */

saxsys.campus.userController.init = function() {
    saxsys.campus.persistence.init();

    //saxsys.campus.userController.tmpUserSlots wird in login-Controller gesetzt
    saxsys.campus.persistence.initUserSlots(saxsys.campus.userController.tmpUserSlots);
    saxsys.campus.userController.generateRoomGrids();

    saxsys.campus.userController.fillSlotList();
    saxsys.campus.userController.fillBookedListview(saxsys.campus.persistence.getUserSlots());
    saxsys.campus.userController.initBookedListview();
    $("#userPageContent").trigger("create");

    $(".book_slot_btn").click(function() {

        var slotID = saxsys.campus.utility.extractSlotId(this.id);

        //remove bookbutton
        $("#" + slotID + "_book_btn").hide();

        var slot = saxsys.campus.persistence.getSlotById(slotID);

        if (saxsys.campus.userController.checkBeforeBooking(slot)) {

            var success = function(data) {
                slot.participants++;
                saxsys.campus.userController.updateFreeCapacity(slot);
                saxsys.campus.persistence.addUserSlot(slot.id);
                saxsys.campus.userController.fillBookedListview(saxsys.campus.persistence.getUserSlots());
                saxsys.campus.userController.initBookedListview();

                $("#user_info_output").popup("open");
                setTimeout(function() {
                    $("#user_info_output").popup("close");
                }, 1500);
            };
            var fail = function(err) {
                var error = jQuery.parseJSON(err.responseText);
                var errorMessage = "FEHLER: " + error.detail;

                saxsys.campus.utility.displayUserError(errorMessage, 3000);

                $("#" + slotID + "_book_btn").show();
            };
            saxsys.campus.restApi.addParticipant(slot, success, fail);
        }
        ;
    });
};

saxsys.campus.userController.initBookedListview = function() {
    $(".delete_slot").click(function(event) {
        event.stopImmediatePropagation();

        var slotID = saxsys.campus.utility.extractSlotId(this.id);
        var slotSelector = "#user_booked_slot_list #" + slotID + "_slot";

        $("#" + slotID + "_book_btn").show();

        var slot = saxsys.campus.persistence.getSlotById(slotID);

        var success = function(data) {
            slot.participants--;
            saxsys.campus.userController.updateFreeCapacity(slot);
            saxsys.campus.persistence.removeUserSlot(slot.id);
            $(slotSelector).remove();
            $("#user_booked_slot_list").listview("refresh");
        };
        var fail = function(err) {
            var error = jQuery.parseJSON(err.responseText);
            var errorMessage = "FEHLER: " + error.detail;

            saxsys.campus.utility.displayUserError(errorMessage, 3000);

            $("#" + slotID + "_book_btn").hide();
        };

        saxsys.campus.restApi.delParticipant(slot, success, fail);
    });

    $("#user_booked_slot_list").listview("refresh");
};

saxsys.campus.userController.generateRoomGrids = function() {
    var rooms = saxsys.campus.persistence.rooms;

    for (var i in rooms) {
        var room = rooms[i];
        saxsys.campus.renderer.renderRoomGrid("#room_grid", room);
    }
    ;
};

saxsys.campus.userController.fillSlotList = function() {
    var slots = saxsys.campus.persistence.slots;

    for (var i in slots) {
        var slot = slots[i];
        saxsys.campus.renderer.renderUserViewDetailSlot(slot);
    }
};

saxsys.campus.userController.fillBookedListview = function(userSlots) {
    $("#user_booked_slot_list").html("");
    if (Array.isArray(userSlots)) {
        for (var i in userSlots) {
            saxsys.campus.userController.renderSlotBooked(userSlots[i].id);
        }
    } else {
        //only one slot
        saxsys.campus.userController.renderSlotBooked(userSlots.id);
    }
};

saxsys.campus.userController.updateFreeCapacity = function(slot) {
    $("#" + slot.id + "_free").text(slot.capacity - slot.participants);
};

saxsys.campus.userController.checkBeforeBooking = function(slot) {
    if (slot.capacity < 1) {
        var errorMessage = "FEHLER: Im Slot " +
                '"' + slot.title + '"' + "ist kein Platz mehr!";

        saxsys.campus.utility.displayUserError(errorMessage, 3000);

        return false;
    }

    var bookedSlots = saxsys.campus.persistence.getUserSlots();

    for (var i in bookedSlots) {
        var currentSlot = saxsys.campus.persistence.getSlotById(bookedSlots[i].id);
        var collision = saxsys.campus.utility.collisionTest(slot, currentSlot);

        if (collision) {
            $("#" + slot.id + "_book_btn").show();

            var errorMessage = "FEHLER: Slot " + '"' + slot.title + '"' +
                    " überschneidet sich zeitlich mit dem Slot " +
                    '"' + currentSlot.title + '"' + "!";

            saxsys.campus.utility.displayUserError(errorMessage, 3000);

            return false;
        }
    }
    return true;
};

saxsys.campus.userController.renderSlotBooked = function(slotID) {
    var slot = saxsys.campus.persistence.getSlotById(slotID);

    saxsys.campus.renderer.renderUserViewBookedSlot("#user_booked_slot_list", slot);

    saxsys.campus.userController.initBookedListview();
};