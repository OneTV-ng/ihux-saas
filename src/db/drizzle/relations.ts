import { relations } from "drizzle-orm/relations";
import { users, adminAlerts, artists, adminTasks, artistProfiles, royalties, songs, tracks, sessions, uploads, userProfiles, usersVerification } from "../schema";

export const adminAlertsRelations = relations(adminAlerts, ({one}) => ({
	user_approvedBy: one(users, {
		fields: [adminAlerts.approvedBy],
		references: [users.id],
		relationName: "adminAlerts_approvedBy_users_id"
	}),
	user_matchedBy: one(users, {
		fields: [adminAlerts.matchedBy],
		references: [users.id],
		relationName: "adminAlerts_matchedBy_users_id"
	}),
	user_resolvedBy: one(users, {
		fields: [adminAlerts.resolvedBy],
		references: [users.id],
		relationName: "adminAlerts_resolvedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	adminAlerts_approvedBy: many(adminAlerts, {
		relationName: "adminAlerts_approvedBy_users_id"
	}),
	adminAlerts_matchedBy: many(adminAlerts, {
		relationName: "adminAlerts_matchedBy_users_id"
	}),
	adminAlerts_resolvedBy: many(adminAlerts, {
		relationName: "adminAlerts_resolvedBy_users_id"
	}),
	adminTasks_assignedTo: many(adminTasks, {
		relationName: "adminTasks_assignedTo_users_id"
	}),
	adminTasks_createdBy: many(adminTasks, {
		relationName: "adminTasks_createdBy_users_id"
	}),
	adminTasks_userId: many(adminTasks, {
		relationName: "adminTasks_userId_users_id"
	}),
	royalties_approvedBy: many(royalties, {
		relationName: "royalties_approvedBy_users_id"
	}),
	royalties_managerId: many(royalties, {
		relationName: "royalties_managerId_users_id"
	}),
	royalties_matchedBy: many(royalties, {
		relationName: "royalties_matchedBy_users_id"
	}),
	royalties_userId: many(royalties, {
		relationName: "royalties_userId_users_id"
	}),
	sessions: many(sessions),
	songs_approvedBy: many(songs, {
		relationName: "songs_approvedBy_users_id"
	}),
	songs_artistId: many(songs, {
		relationName: "songs_artistId_users_id"
	}),
	songs_createdBy: many(songs, {
		relationName: "songs_createdBy_users_id"
	}),
	songs_flaggedBy: many(songs, {
		relationName: "songs_flaggedBy_users_id"
	}),
	songs_managedBy: many(songs, {
		relationName: "songs_managedBy_users_id"
	}),
	uploads: many(uploads),
	userProfiles: many(userProfiles),
	usersVerifications_reviewedBy: many(usersVerification, {
		relationName: "usersVerification_reviewedBy_users_id"
	}),
	usersVerifications_userId: many(usersVerification, {
		relationName: "usersVerification_userId_users_id"
	}),
}));

export const adminTasksRelations = relations(adminTasks, ({one}) => ({
	artist: one(artists, {
		fields: [adminTasks.artistId],
		references: [artists.id]
	}),
	user_assignedTo: one(users, {
		fields: [adminTasks.assignedTo],
		references: [users.id],
		relationName: "adminTasks_assignedTo_users_id"
	}),
	user_createdBy: one(users, {
		fields: [adminTasks.createdBy],
		references: [users.id],
		relationName: "adminTasks_createdBy_users_id"
	}),
	user_userId: one(users, {
		fields: [adminTasks.userId],
		references: [users.id],
		relationName: "adminTasks_userId_users_id"
	}),
}));

export const artistsRelations = relations(artists, ({many}) => ({
	adminTasks: many(adminTasks),
	artistProfiles: many(artistProfiles),
}));

export const artistProfilesRelations = relations(artistProfiles, ({one}) => ({
	artist: one(artists, {
		fields: [artistProfiles.artistId],
		references: [artists.id]
	}),
}));

export const royaltiesRelations = relations(royalties, ({one}) => ({
	user_approvedBy: one(users, {
		fields: [royalties.approvedBy],
		references: [users.id],
		relationName: "royalties_approvedBy_users_id"
	}),
	user_managerId: one(users, {
		fields: [royalties.managerId],
		references: [users.id],
		relationName: "royalties_managerId_users_id"
	}),
	user_matchedBy: one(users, {
		fields: [royalties.matchedBy],
		references: [users.id],
		relationName: "royalties_matchedBy_users_id"
	}),
	song: one(songs, {
		fields: [royalties.songId],
		references: [songs.id]
	}),
	track: one(tracks, {
		fields: [royalties.trackId],
		references: [tracks.id]
	}),
	user_userId: one(users, {
		fields: [royalties.userId],
		references: [users.id],
		relationName: "royalties_userId_users_id"
	}),
}));

export const songsRelations = relations(songs, ({one, many}) => ({
	royalties: many(royalties),
	user_approvedBy: one(users, {
		fields: [songs.approvedBy],
		references: [users.id],
		relationName: "songs_approvedBy_users_id"
	}),
	user_flaggedBy: one(users, {
		fields: [songs.flaggedBy],
		references: [users.id],
		relationName: "songs_flaggedBy_users_id"
	}),
	tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({one, many}) => ({
	royalties: many(royalties),
	song: one(songs, {
		fields: [tracks.songId],
		references: [songs.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const uploadsRelations = relations(uploads, ({one}) => ({
	user: one(users, {
		fields: [uploads.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));

export const usersVerificationRelations = relations(usersVerification, ({one}) => ({
	user_reviewedBy: one(users, {
		fields: [usersVerification.reviewedBy],
		references: [users.id],
		relationName: "usersVerification_reviewedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [usersVerification.userId],
		references: [users.id],
		relationName: "usersVerification_userId_users_id"
	}),
}));