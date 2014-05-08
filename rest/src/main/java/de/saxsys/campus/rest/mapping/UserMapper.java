package de.saxsys.campus.rest.mapping;

import java.net.URI;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.core.UriBuilder;

import com.theoryinpractise.halbuilder.api.Representation;
import com.theoryinpractise.halbuilder.api.RepresentationFactory;

import de.saxsys.campus.domain.User;
import de.saxsys.campus.rest.resource.SlotResource;
import de.saxsys.campus.rest.resource.UserResource;

@Singleton
public class UserMapper {

	private static final String SLOTS = "slots";

	@Inject
	private RepresentationFactory representationFactory;

	public Representation createRepresentation(URI baseUri, User user) {
		return representationFactory
				.newRepresentation(
						UriBuilder.fromUri(baseUri).path(UserResource.class)
								.path(UserResource.class, "getCurrentUser").build())
				.withProperty("id", user.getId())
				.withProperty("username", user.getUsername())
				.withProperty("role", user.getRole())
				.withLink(
						SLOTS,
						UriBuilder.fromUri(baseUri).path(SlotResource.class)
								.queryParam("currentUser", true).build());
	}
}
