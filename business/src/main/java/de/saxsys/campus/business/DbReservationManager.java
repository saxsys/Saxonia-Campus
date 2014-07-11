package de.saxsys.campus.business;

import java.util.List;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.validation.constraints.NotNull;

import de.saxsys.campus.domain.Slot;
import de.saxsys.campus.domain.User;

@Stateless
public class DbReservationManager implements ReservationManager {

	@PersistenceContext
	private EntityManager em;

	@Inject
	private SlotManager slotManager;

	@Inject
	private UserManager userManager;

	@Override
	public Slot createReservation(@NotNull User user, @NotNull Slot slot)
			throws OverlapsReservationException {
		// if (slot.isBookedOut()) {
		// throw new AlreadyBookedOutException();
		// }
		List<Slot> bookedSlots = user.getSlotList();
		for (Slot bookedSlot : bookedSlots) {
			if (slot.overlaps(bookedSlot)) {
				throw new OverlapsReservationException(bookedSlot);
			}
		}
		slot.addParticipant(user);
		final Slot updatedSlot = slotManager.updateSlot(slot);
		userManager.updateUser(user);
		return updatedSlot;
	}

	@Override
	public void cancelReservation(@NotNull User user, @NotNull Slot slot) {
		slot.removeParticipant(user);
		slotManager.updateSlot(slot);
		userManager.updateUser(user);
	}

	@Override
	public List<Slot> getReservations(@NotNull User user) {
		return user.getSlotList();
	}

}
