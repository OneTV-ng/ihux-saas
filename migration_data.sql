--
-- PostgreSQL database dump
--

\restrict 5FEGNfbHPcYjYoNped7Sbme5i9P3ZKnCJV2yFS9kjB0y5aktKQyt9u6Gd2bS3ej

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at, role, banned, ban_reason, ban_expires, username, phone, whatsapp, date_of_birth, address, record_label, social_media, bank_details, settings, api_class, thumbnail, profile_picture, header_background, first_name, last_name, gender) FROM stdin;
BFBr0eWe7jWr765BPfv95CrFi2wqUDrS	Favour Ijinda	favourijinda2000@gmail.com	t	\N	2026-02-10 18:15:49.671	2026-02-10 18:30:01.945	manager	f	\N	\N	favour			\N		mstudios	\N	\N	\N	5	\N	\N	\N	\N	\N	\N
YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	Reginald Richmen	onetv.ng@gmail.com	t	/uploads/renny/profile/1770749495650.jpeg	2026-02-09 06:05:00.51	2026-02-10 18:52:01.585	admin	f	\N	\N	renny	+2348055787878	+2348055787878	1972-11-26	16 Market Road jP crescent\nRumuosi Ozuoba link Road	mStudios	{"facebook":"@1Radio.Oguta","instagram":"@rrichmen","twitter":"@rrichy","tiktok":"","youtube":"","spotify":"","appleMusic":""}	{"bankName":"Access","accountNumber":"Mallam@24","accountName":"Reginald Richmen","sortCode":"8378957897","swiftCode":"GGDGDS","paypalEmail":"dev@imediaport.com"}	\N	5	\N	\N	\N	\N	\N	\N
1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	Jessy Richmen	jessy@1tv.ng	t	/uploads/jesse/profile/1770708719387.png	2026-02-09 14:40:12.509	2026-02-10 08:03:04.058	user	f	\N	\N	jesse	+2348055787878	+2348055787878	1972-11-26	16 JP Cresent Rumosi	Kaycee records	{"facebook":"@rrichmen","instagram":"@site_man","twitter":"@rrichmen","tiktok":"","youtube":"","spotify":"","appleMusic":""}	{"bankName":"AccessBank","accountNumber":"Mallam@24","accountName":"Reginald Rchmen","sortCode":"5875894","swiftCode":"GDSFTSHGS","paypalEmail":"onetv.ng@gmail.com"}	\N	5	/uploads/jesse/thumbnail/1770710570393.jpg	\N	/uploads/jesse/header/1770710580585.jpg	\N	\N	\N
tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	Reginald Richmen	mstudios.me@gmail.com	t	/uploads/mstudios/profile/1770671923225.jpg	2026-02-09 14:23:58.992	2026-02-10 14:21:28.336	user	f	\N	\N	mstudios	+2348055787878	+2348055787878	1972-11-26	16 Market Road jP crescent\nRumuosi Ozuoba link Road	mStudios	{"facebook":"@1Radio.Oguta","instagram":"@rrichmen","twitter":"@rrichy","tiktok":"@Richmen","youtube":"@onetvliveng","spotify":"@reginaldRichuy","appleMusic":"@emi F Moto"}	{"bankName":"Access","accountNumber":"Mallam@24","accountName":"Reginald Richmen","sortCode":"8378957897","swiftCode":"GGDGDS","paypalEmail":"dr.el@me.com"}	\N	5	/uploads/mstudios/thumbnail/1770733285755.jpg	\N	/uploads/mstudios/header/1770673810596.jpg	\N	\N	\N
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
yyasVDZZXoBlWtWyAzlFeFFacsObIALT	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	credential	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	\N	\N	\N	\N	\N	\N	1df1c946f2a63b3332ba6b2972bf4c07:ad997aa7f236f1c2d27ae862cbcb45e8f0951955773e923f7ebebd375c0f546d7bb85a617f0b26c77d8606e7c004110dae5e3c34dca447bc804fe6fe0278c858	2026-02-09 06:05:00.543	2026-02-09 06:05:00.543
dD5UPNUQUAwnkCnuocwDm072uEWKp6IH	tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	credential	tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	\N	\N	\N	\N	\N	\N	288962ddb542b7a2b948e580431e2490:384e14aed1101350d6724c3148f4e5b142602349ed5bbb84cede5f064de7172426ddae79d41058b4cf8a12f733e06b66564285291138986df3bcc7165b339f3f	2026-02-09 14:23:58.999	2026-02-09 14:23:58.999
eGH0p5zvGjbWFQAG6rM2HI289VpBbOYw	1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	credential	1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	\N	\N	\N	\N	\N	\N	6e379fe81535c663f483c28186e57a17:782a9cb0abc2c10d468e59b998c52e1e2b46d81bba42971a311a972bec9d43ddb4403508ddbfe2dae9a59b8c1d71edd595f288d4c6a87273c525b28eb922b644	2026-02-09 14:40:12.517	2026-02-09 14:40:12.517
OJQry83uZEVLOHEZwxE8WHYbi8cXUJ3X	BFBr0eWe7jWr765BPfv95CrFi2wqUDrS	credential	BFBr0eWe7jWr765BPfv95CrFi2wqUDrS	\N	\N	\N	\N	\N	\N	c2a1673bbcd280454c004b10a0e4eb46:8c4ab44a2a453bbc93b5105bd8632ade1ef48a574b664c12f717a1e20139c2c381a1de1940853d9643d784a6d1b998e31e8f51558f759911f95d994df6c16f8b	2026-02-10 18:15:58.33	2026-02-10 18:15:58.33
\.


--
-- Data for Name: admin_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_alerts (id, type, severity, title, message, entity_type, entity_id, status, resolved_by, resolved_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_tasks (id, title, description, priority, status, assigned_to, created_by, due_date, completed_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, user_id, key, name, api_class, rate_limit, status, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artists (id, user_id, artist_name, display_name, slug, bio, city, country, birthday, gender, genre, contact, legal_id, contract, is_active, created_at, updated_at, record_label) FROM stdin;
a3602f84-6b6b-4334-bf24-8b7d1383e37e	tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	Emi F Moto	Emi F. Moto	emi-f-moto	The street prophet	Port Harcourt	Nigeria	\N	male	pop	\N	\N	\N	t	2026-02-10 12:57:37.347	2026-02-10 12:57:37.347	mStudios
f68a464b-f2ba-406f-a210-93ae31326dd2	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	Dr El Hassan	Dr. EL Hassan	dr-el-hassan	The Messanger	Port Harcourt	Nigeria	\N	male	pop	\N	\N	\N	t	2026-02-10 18:56:04.734	2026-02-10 18:56:04.734	mStudios
\.


--
-- Data for Name: artist_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artist_profiles (id, picture, thumbnails, gallery, media_platform, social_media, fan_news, is_public, is_verified, total_songs, total_plays, total_followers, created_at, updated_at, artist_id, press, is_featured) FROM stdin;
a1a691e9-16ca-4e54-a6ba-5ed3dc89d2a1	\N	\N	\N	\N	\N	\N	t	f	0	0	0	2026-02-10 12:57:37.363	2026-02-10 12:57:37.363	a3602f84-6b6b-4334-bf24-8b7d1383e37e	\N	f
83bbf228-9b9c-4bae-97f9-cc2cbf50b2f6	\N	\N	\N	\N	\N	\N	t	f	0	0	0	2026-02-10 18:56:04.751	2026-02-10 18:56:04.751	f68a464b-f2ba-406f-a210-93ae31326dd2	\N	f
\.


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.songs (id, title, artist_id, artist_name, type, genre, language, upc, cover, number_of_tracks, status, flag_type, flag_reason, flagged_at, flagged_by, approved_by, approved_at, created_by, managed_by, created_at, updated_at, deleted_at, is_featured) FROM stdin;
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tracks (id, song_id, track_number, title, isrc, mp3, explicit, lyrics, lead_vocal, producer, writer, duration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: royalties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.royalties (id, period, period_type, upc, isrc, track_name, song_title, artist_name, record_label, gross_amount_usd, deductions_percent, deductions_usd, net_amount_usd, payment_status, song_id, track_id, artist_id, user_id, manager_id, match_status, matched_by, matched_at, approved_by, approved_at, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id, impersonated_by) FROM stdin;
f2n97NR7A2NBw4M7Jj1qnfVlsLSC4qVY	2026-02-16 20:28:19.923	pxBcMzSAc3GMgp1IlvIGvTuXaVH3FnH5	2026-02-09 20:28:19.929	2026-02-09 20:28:19.929			1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	\N
2gxeO9M9ChFyQfo32ehtPhWbWU7hwbV2	2026-02-17 02:33:59.271	rH8GcwNcZhiW8AHUCYTZ7AuMc2UG0Bpt	2026-02-10 02:33:59.279	2026-02-10 02:33:59.279			1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	\N
F1Uoi5njdGPIiwBNzBKDM3iLuD6yNacK	2026-02-17 18:08:14.64	7DU2gy565cew23Lp24Idf3uSEIIGeSXP	2026-02-10 18:08:14.652	2026-02-10 18:08:14.652	127.0.0.1	curl/8.5.0	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	\N
Ch5eVfZXKon4Wg17DJhO99D0S6Hei87W	2026-02-17 18:10:36.295	CXAV7abq2cyv6QuhNhaaMneSnKtqIrg5	2026-02-10 18:10:36.301	2026-02-10 18:10:36.301			YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	\N
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploads (id, user_id, filename, original_name, mime_type, size, status, path, url, checksum, chunk_size, total_chunks, uploaded_chunks, progress, metadata, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (id, user_id, username, firstname, lastname, bio, language, platform, socials, preferences, metadata, created_at, updated_at, selected_artist_id) FROM stdin;
2d1dbd5c-cf5b-4948-83b5-06c0ef11f170	1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	\N	Jessy	Richmen	\N	en	web	\N	\N	{"gender": "male", "ref_code": null, "registered_at": "2026-02-09T14:40:16.199Z"}	2026-02-09 15:40:16.202944	2026-02-09 15:40:16.202944	\N
1a6c9ad8-a573-4451-b720-55db1bc6aa58	tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	\N	Reginald	Richmen	\N	en	web	\N	\N	{"gender": "male", "ref_code": null, "registered_at": "2026-02-09T14:24:00.085Z"}	2026-02-09 15:24:00.088494	2026-02-10 17:06:22.532	a3602f84-6b6b-4334-bf24-8b7d1383e37e
319bb476-5725-4177-b24f-c57e6f4168fb	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	\N	\N	\N	\N	en	web	\N	\N	\N	2026-02-10 18:56:04.795	2026-02-10 18:56:22.834	f68a464b-f2ba-406f-a210-93ae31326dd2
\.


--
-- Data for Name: user_verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_verification (id, user_id, status, submitted_at, processed_at, verified_at, remark, rejection_reason, flag_reason, reviewed_by, government_id_url, signature_url, completion_percentage, created_at, updated_at) FROM stdin;
eda53e5c-e5ea-444e-a6c1-1098f37566e0	1rcUFOtqQXE4ydZ8SLd81OCiyBaq9rEE	verified	2026-02-10 08:36:44.164	\N	2026-02-10 18:12:42.074	\N	\N	\N	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	/uploads/jesse/governmentid/1770707748422.jpeg	/uploads/jesse/signature/1770707742903.png	0	2026-02-10 07:15:53.312	2026-02-10 18:12:42.074
3ae5b896-b2dc-4e3f-a172-38c1209ef1c6	tZ6mqVcXsFaoFjHj9NdGXoaNm5enhH92	verified	2026-02-10 12:11:57.131	\N	2026-02-10 18:14:18.661	\N	\N	\N	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	/uploads/mstudios/governmentid/1770725495353.jpeg	/uploads/mstudios/signature/1770725501826.png	0	2026-02-10 12:11:44.099	2026-02-10 18:14:18.661
8ff613ab-ecb1-4df8-859e-b03aecdbe9a9	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	verified	2026-02-10 18:52:19.892	\N	2026-02-10 18:54:01.436	\N	\N	\N	YjYTKjktVJCIVBRDgqBUCXmYFfu46I1P	/uploads/renny/governmentid/1770749515864.jpeg	/uploads/renny/signature/1770749509173.png	0	2026-02-10 18:49:49.697	2026-02-10 18:54:01.436
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at, type) FROM stdin;
d59oMOuYxhKvlBlfdYdPI1InLnm40Xqx	ceeCClbPCvV9ibbjl3a_XnezD76j2ICc	{"callbackURL":"/dashboard","codeVerifier":"VEaeFK_2R4Dsn27hWmP9Gi_DCtnGgwK8woboLphrRIuTGNvjaNJDJXjqVICetGcpM-Bpw6Kv07rC1-ZpJp4zE75bDeGdwwXjYAJsBjNXHsj-Ynjsvr_yRNq9r9oq-dFI","expiresAt":1770617992284}	2026-02-09 06:19:52.294	2026-02-09 06:09:52.295	2026-02-09 06:09:52.295	\N
49cd8d05-afc2-469d-b5f8-b0a5d888b35f	mstudios.me@gmail.com	359519	2026-02-09 14:44:13.007	2026-02-09 14:34:13.007	2026-02-09 14:34:13.007	pin-verification
6411a8cb-4d7b-4c03-a1a2-7abe7ed7ff03	jessy@1tv.ng	855726	2026-02-09 18:27:41.594	2026-02-09 18:17:41.598	2026-02-09 18:17:41.598	pin-verification
o2lfbi7fkUetR6rs8IVYJU87cs3rkUl1	fYETyvHN52p3mhCNfPPAs5ZbVwcMogwS	{"callbackURL":"/dashboard","codeVerifier":"yTotAuMgJK23BxOdrNcQY5c5UB5ElA2oebyJlAcaCOLTLFp4EOdbwt0XnYXjc2ySQ2D-yx_fsqLswSHLPr010qcK_1-DHOgq2Sd1E4xJlBcr4iHdh7Xc2d1Dd-27E8ZG","expiresAt":1770673223641}	2026-02-09 21:40:23.651	2026-02-09 21:30:23.652	2026-02-09 21:30:23.652	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 5FEGNfbHPcYjYoNped7Sbme5i9P3ZKnCJV2yFS9kjB0y5aktKQyt9u6Gd2bS3ej

