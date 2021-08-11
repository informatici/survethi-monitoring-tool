-- ADD NEW FIELDS FROM ARCGIS
ALTER TABLE LOCATION 
ADD COLUMN LOC_RK_CODE INT NULL AFTER LOC_DIST_ID_B,
ADD COLUMN LOC_W_CODE INT NULL AFTER LOC_RK_CODE;

-- ADDUPDATE COMMANDS FOR LOC_RK_CODE
UPDATE LOCATION SET LOC_RK_CODE='4130101' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Gindo';
UPDATE LOCATION SET LOC_RK_CODE='4130201' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Chitu Town';
UPDATE LOCATION SET LOC_RK_CODE='4131201' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Goro Town';
UPDATE LOCATION SET LOC_RK_CODE='4131202' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Gurura Town';
UPDATE LOCATION SET LOC_RK_CODE='41301002' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Ajo Lita';
UPDATE LOCATION SET LOC_RK_CODE='41301004' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Ajo Baha';
UPDATE LOCATION SET LOC_RK_CODE='41301006' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Kura Bole';
UPDATE LOCATION SET LOC_RK_CODE='41301007' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Kechemei Jirein';
UPDATE LOCATION SET LOC_RK_CODE='41301008' WHERE LOC_CITY = 'Amaya' and LOC_ADDRESS = 'Kerisa Kilei';
UPDATE LOCATION SET LOC_RK_CODE='41301009' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Guilt Bola';
UPDATE LOCATION SET LOC_RK_CODE='41301010' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Kaba Leku';
UPDATE LOCATION SET LOC_RK_CODE='41301011' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Berei Tirtira';
UPDATE LOCATION SET LOC_RK_CODE='41301012' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Ajamo Kura';
UPDATE LOCATION SET LOC_RK_CODE='41301013' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Jibat Kuchulo';
UPDATE LOCATION SET LOC_RK_CODE='41301015' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Abado Holei';
UPDATE LOCATION SET LOC_RK_CODE='41301016' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Dire Aroji';
UPDATE LOCATION SET LOC_RK_CODE='41301026' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Gemborei Aliye';
UPDATE LOCATION SET LOC_RK_CODE='41301027' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Kono Kulit';
UPDATE LOCATION SET LOC_RK_CODE='41301028' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Bereida Chilalo';
UPDATE LOCATION SET LOC_RK_CODE='41301029' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Bero Muri Yaa';
UPDATE LOCATION SET LOC_RK_CODE='41301035' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Abuye Jebilal';
UPDATE LOCATION SET LOC_RK_CODE='41302002' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Haro Wonchi';
UPDATE LOCATION SET LOC_RK_CODE='41302004' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Damu Degelei';
UPDATE LOCATION SET LOC_RK_CODE='41302007' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Worabu Massi';
UPDATE LOCATION SET LOC_RK_CODE='41302009' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Merga Abiye';
UPDATE LOCATION SET LOC_RK_CODE='41302010' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Kurfo Gutei';
UPDATE LOCATION SET LOC_RK_CODE='41302013' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Dulelei kori';
UPDATE LOCATION SET LOC_RK_CODE='41302014' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Dae Wendimtu';
UPDATE LOCATION SET LOC_RK_CODE='41302016' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Haro Beseka';
UPDATE LOCATION SET LOC_RK_CODE='41302017' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Dimtu Godeti';
UPDATE LOCATION SET LOC_RK_CODE='41302018' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Dulelei Bilacha';
UPDATE LOCATION SET LOC_RK_CODE='41302020' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Degoye Galiye';
UPDATE LOCATION SET LOC_RK_CODE='41302021' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Belbela Bulbula';
UPDATE LOCATION SET LOC_RK_CODE='41302022' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Haro Kono';
UPDATE LOCATION SET LOC_RK_CODE='41304007' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Mekeit Suntarei';
UPDATE LOCATION SET LOC_RK_CODE='41304011' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Gora Roge';
UPDATE LOCATION SET LOC_RK_CODE='41304013' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Kelecho Gerbi';
UPDATE LOCATION SET LOC_RK_CODE='41304017' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Gombissa Kusaye';
UPDATE LOCATION SET LOC_RK_CODE='41304018' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Ulma Busa';
UPDATE LOCATION SET LOC_RK_CODE='41304019' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Nano Gebreil';
UPDATE LOCATION SET LOC_RK_CODE='41304022' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Dawo Kera';
UPDATE LOCATION SET LOC_RK_CODE='41308001' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Dawa Bisei';
UPDATE LOCATION SET LOC_RK_CODE='41308002' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Alei';
UPDATE LOCATION SET LOC_RK_CODE='41308007' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Woserbi Migridi';
UPDATE LOCATION SET LOC_RK_CODE='41308011' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Kura Luku';
UPDATE LOCATION SET LOC_RK_CODE='41308015' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Dokat';
UPDATE LOCATION SET LOC_RK_CODE='41308018' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Bantu Boda';
UPDATE LOCATION SET LOC_RK_CODE='41308021' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Tumei Wayu';
UPDATE LOCATION SET LOC_RK_CODE='41309003' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Jeto';
UPDATE LOCATION SET LOC_RK_CODE='41309004' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Woserbi Abeti';
UPDATE LOCATION SET LOC_RK_CODE='41309006' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Bessa';
UPDATE LOCATION SET LOC_RK_CODE='41309009' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Deka Guda';
UPDATE LOCATION SET LOC_RK_CODE='41309010' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Kara Sedeik';
UPDATE LOCATION SET LOC_RK_CODE='41309011' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Soyoma';
UPDATE LOCATION SET LOC_RK_CODE='41309014' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Sodo Liben';
UPDATE LOCATION SET LOC_RK_CODE='41309018' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Mendei Tufissa';
UPDATE LOCATION SET LOC_RK_CODE='41310004' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Alga Woserbi';
UPDATE LOCATION SET LOC_RK_CODE='41310005' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Tolei Dalota';
UPDATE LOCATION SET LOC_RK_CODE='41310007' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Adadi Borale';
UPDATE LOCATION SET LOC_RK_CODE='41310020' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Aderei Kotebei'; -- same area with different names
UPDATE LOCATION SET LOC_RK_CODE='41310020' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Acheber'; -- same area with different names
UPDATE LOCATION SET LOC_RK_CODE='41310020' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Enge'; -- same area with different names
UPDATE LOCATION SET LOC_RK_CODE='41312001' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Dibidiba Abado';
UPDATE LOCATION SET LOC_RK_CODE='41312002' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Chirecha Tedira';
UPDATE LOCATION SET LOC_RK_CODE='41312003' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Leman Abu';
UPDATE LOCATION SET LOC_RK_CODE='41312005' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Bekisei';
UPDATE LOCATION SET LOC_RK_CODE='41312007' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Dembi Kono';
UPDATE LOCATION SET LOC_RK_CODE='41312008' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Dogema Dembi';
UPDATE LOCATION SET LOC_RK_CODE='41312009' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Keinteiro Bido';
UPDATE LOCATION SET LOC_RK_CODE='41312013' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Dembel Dildilla';
UPDATE LOCATION SET LOC_RK_CODE='41312015' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Gambeilla Goro';
UPDATE LOCATION SET LOC_RK_CODE='41312017' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Wayu';
UPDATE LOCATION SET LOC_RK_CODE='41312019' WHERE LOC_CITY='Goro' AND LOC_ADDRESS='Galiye Rogda';
UPDATE LOCATION SET LOC_RK_CODE='40508032' WHERE LOC_CITY='Nono' AND LOC_ADDRESS='Jirra Gemechu';

UPDATE LOCATION SET LOC_RK_CODE='41303032' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Kono Lefe Arba';
UPDATE LOCATION SET LOC_RK_CODE='41310012' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Godei Dula';

UPDATE LOCATION SET LOC_RK_CODE='40415091' WHERE LOC_CITY = 'Chora Boter' and LOC_ADDRESS = 'Tolay';
UPDATE LOCATION SET LOC_RK_CODE='40415014' WHERE LOC_CITY = 'Chora Boter' and LOC_ADDRESS = 'Bege';

UPDATE LOCATION SET LOC_RK_CODE='4130301' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Dilela Town';
UPDATE LOCATION SET LOC_RK_CODE='4130901' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Tullu Bollo';
UPDATE LOCATION SET LOC_RK_CODE='41301014' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Aroji Ejersa';
UPDATE LOCATION SET LOC_RK_CODE='41301022' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Meri Sekela';
UPDATE LOCATION SET LOC_RK_CODE='41301023' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Ashutei Gambela';
UPDATE LOCATION SET LOC_RK_CODE='41301034' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Wechileli Dobi';
UPDATE LOCATION SET LOC_RK_CODE='41303001' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Dese Jebo';
UPDATE LOCATION SET LOC_RK_CODE='41303002' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Ale Koya';
UPDATE LOCATION SET LOC_RK_CODE='41303003' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Doyo Kora';
UPDATE LOCATION SET LOC_RK_CODE='41303005' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Maru Babali';
UPDATE LOCATION SET LOC_RK_CODE='41303007' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Adami Gotu';
UPDATE LOCATION SET LOC_RK_CODE='41303008' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Warabu Bariyu';
UPDATE LOCATION SET LOC_RK_CODE='41303010' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Karo Simela';
UPDATE LOCATION SET LOC_RK_CODE='41303011' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Maru Fekei';
UPDATE LOCATION SET LOC_RK_CODE='41303012' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Dembali Keta';
UPDATE LOCATION SET LOC_RK_CODE='41303013' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Gute Godeti';
UPDATE LOCATION SET LOC_RK_CODE='41303014' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Bedeisa Koricha';
UPDATE LOCATION SET LOC_RK_CODE='41303015' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Obi Koji';
UPDATE LOCATION SET LOC_RK_CODE='41303017' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Beda Keiro';
UPDATE LOCATION SET LOC_RK_CODE='41303018' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Gadu Kistana';
UPDATE LOCATION SET LOC_RK_CODE='41303020' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Sodo Gerbo';
UPDATE LOCATION SET LOC_RK_CODE='41303021' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Jelisa Cheka';
UPDATE LOCATION SET LOC_RK_CODE='41303025' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Dire Duleti';
UPDATE LOCATION SET LOC_RK_CODE='41303026' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Fodu Gora';
UPDATE LOCATION SET LOC_RK_CODE='41303028' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Chefe Mekana';
UPDATE LOCATION SET LOC_RK_CODE='41303030' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Gurura Baka';
UPDATE LOCATION SET LOC_RK_CODE='41303031' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Bukasa Keta';
UPDATE LOCATION SET LOC_RK_CODE='41303034' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Dildila Mangura'; -- same area with different names
UPDATE LOCATION SET LOC_RK_CODE='41303034' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Korke'; -- same area with different names
UPDATE LOCATION SET LOC_RK_CODE='41303035' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Derare Ebicha';
UPDATE LOCATION SET LOC_RK_CODE='41304012' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Tajib Gora Sakeyo';
UPDATE LOCATION SET LOC_RK_CODE='41308022' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Gonen Bubissa';
UPDATE LOCATION SET LOC_RK_CODE='41310009' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Ailo';
UPDATE LOCATION SET LOC_RK_CODE='41310011' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Fissewo'; -- we should merge these two in the shapefile
UPDATE LOCATION SET LOC_RK_CODE='41310014' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Fissewo'; -- we should merge these two in the shapefile
UPDATE LOCATION SET LOC_RK_CODE='41310018' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Kesht';

UPDATE LOCATION SET LOC_RK_CODE='4130801' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Banitu Town';
UPDATE LOCATION SET LOC_RK_CODE='4131001' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Harbu Chululei';
UPDATE LOCATION SET LOC_RK_CODE='41301024' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Moko Ujuba Kota';
UPDATE LOCATION SET LOC_RK_CODE='41303022' WHERE LOC_CITY='Wolisso Rural' AND LOC_ADDRESS='Kile';
UPDATE LOCATION SET LOC_RK_CODE='41304006' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Kerssa Adeyi Galutei';
UPDATE LOCATION SET LOC_RK_CODE='41305008' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Alengo Tullu';
UPDATE LOCATION SET LOC_RK_CODE='41307001' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Goro Gebreil';
UPDATE LOCATION SET LOC_RK_CODE='41307004' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Awash Felte';
UPDATE LOCATION SET LOC_RK_CODE='41307006' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Godeiti Wanber';
UPDATE LOCATION SET LOC_RK_CODE='41307022' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Ilala Seden';
UPDATE LOCATION SET LOC_RK_CODE='41307025' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Chobo Misdo';
UPDATE LOCATION SET LOC_RK_CODE='41307027' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Cheleb Titu';
UPDATE LOCATION SET LOC_RK_CODE='41308023' WHERE LOC_CITY='Tole' AND LOC_ADDRESS='Amrufo Solole';
UPDATE LOCATION SET LOC_RK_CODE='41309019' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Shankur';
UPDATE LOCATION SET LOC_RK_CODE='41310002' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Mudena Ibayu';
UPDATE LOCATION SET LOC_RK_CODE='41310013' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Ireinsso Alei Abeyi';
UPDATE LOCATION SET LOC_RK_CODE='41310016' WHERE LOC_CITY='Seden Sodo' AND LOC_ADDRESS='Ireinsso chewa Daregot';
UPDATE LOCATION SET LOC_RK_CODE='4051001' WHERE LOC_CITY='Dendi' AND LOC_ADDRESS='Ginchi';
UPDATE LOCATION SET LOC_RK_CODE='41312010' WHERE LOC_CITY='Goro' AND LOC_ADDRESS = 'Burka Bido';
UPDATE LOCATION SET LOC_RK_CODE='41302011' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Fite wato';
UPDATE LOCATION SET LOC_RK_CODE='41302001' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Odo Fura';
UPDATE LOCATION SET LOC_RK_CODE='41301003' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Ajo Jidu';
UPDATE LOCATION SET LOC_RK_CODE='41301021' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Arbaseden Kura';
UPDATE LOCATION SET LOC_RK_CODE='41301025' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Cheha Kesei';
UPDATE LOCATION SET LOC_RK_CODE='41301005' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Gutei Itiya';
UPDATE LOCATION SET LOC_RK_CODE='41301031' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Hudad 01';
UPDATE LOCATION SET LOC_RK_CODE='41301031' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Hudad 02';
UPDATE LOCATION SET LOC_RK_CODE='41301031' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Hudad 03';
UPDATE LOCATION SET LOC_RK_CODE='41301001' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Mugno Jila';
UPDATE LOCATION SET LOC_RK_CODE='41301032' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Tiro Ilala';
UPDATE LOCATION SET LOC_RK_CODE='41301020' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Tsega Lafto';
UPDATE LOCATION SET LOC_RK_CODE='41301019' WHERE LOC_CITY='Amaya' AND LOC_ADDRESS='Tumi Bino Sombo';

UPDATE LOCATION SET LOC_RK_CODE='41309016' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Bebeli Debegna';
UPDATE LOCATION SET LOC_RK_CODE='41309013' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Insilalei Keta';
UPDATE LOCATION SET LOC_RK_CODE='41309001' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Lencha Keshemei';
UPDATE LOCATION SET LOC_RK_CODE='41309015' WHERE LOC_CITY='Becho' AND LOC_ADDRESS='Urago Tedei';

UPDATE LOCATION SET LOC_RK_CODE='41304024' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Belchi Kenchera';
UPDATE LOCATION SET LOC_RK_CODE='41304023' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Beshi Kiltu';
UPDATE LOCATION SET LOC_RK_CODE='41304016' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Dere Ilanso';
UPDATE LOCATION SET LOC_RK_CODE='41304010' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Kenchera Alito';
UPDATE LOCATION SET LOC_RK_CODE='41304005' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Kerssa Bombi';
UPDATE LOCATION SET LOC_RK_CODE='41304014' WHERE LOC_CITY='Dawo' AND LOC_ADDRESS='Seiderei Harbu';

UPDATE LOCATION SET LOC_RK_CODE='41307024' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Alga Delat';
UPDATE LOCATION SET LOC_RK_CODE='41307014' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Arifeta';
UPDATE LOCATION SET LOC_RK_CODE='41307013' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Baye Giche';
UPDATE LOCATION SET LOC_RK_CODE='41307010' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Chancho Robe';
UPDATE LOCATION SET LOC_RK_CODE='41307023' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Damota daskekelo';
UPDATE LOCATION SET LOC_RK_CODE='41307005' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Denbi Roge';
UPDATE LOCATION SET LOC_RK_CODE='41307031' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Dewel Deira';
UPDATE LOCATION SET LOC_RK_CODE='41307018' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Gutu Urji';
UPDATE LOCATION SET LOC_RK_CODE='41307003' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Harbu Wanbera';
UPDATE LOCATION SET LOC_RK_CODE='41307030' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Ilala Wako';
UPDATE LOCATION SET LOC_RK_CODE='41307017' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Kaso Mamei';
UPDATE LOCATION SET LOC_RK_CODE='41307011' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Kusaye Bode';
UPDATE LOCATION SET LOC_RK_CODE='41307015' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Kusaye Tiro';
UPDATE LOCATION SET LOC_RK_CODE='4130701' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Lemen 01';
UPDATE LOCATION SET LOC_RK_CODE='41307016' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Mazoria Golba';
UPDATE LOCATION SET LOC_RK_CODE='41307007' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Muti Alibo';
UPDATE LOCATION SET LOC_RK_CODE='41307008' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Muti Dayui';
UPDATE LOCATION SET LOC_RK_CODE='41307019' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Taa Gola';
UPDATE LOCATION SET LOC_RK_CODE='41307026' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Tuka Godeti';
UPDATE LOCATION SET LOC_RK_CODE='41307021' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Tumei Wato';
UPDATE LOCATION SET LOC_RK_CODE='41307020' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Worabo Haro';
UPDATE LOCATION SET LOC_RK_CODE='41307012' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Kersa Warko';
UPDATE LOCATION SET LOC_RK_CODE='41307002' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Korei Sabi';
UPDATE LOCATION SET LOC_RK_CODE='41307029' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Hawa Wayu';
UPDATE LOCATION SET LOC_RK_CODE='41307028' WHERE LOC_CITY='Kersa Malima' AND LOC_ADDRESS='Hawa Dangago';

UPDATE LOCATION SET LOC_RK_CODE='41302005' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Azer Qerensa';
UPDATE LOCATION SET LOC_RK_CODE='41302012' WHERE LOC_CITY='Wonchi' AND LOC_ADDRESS='Senkolei Kake';

UPDATE LOCATION SET LOC_RK_CODE = '41310006' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Balekese';
UPDATE LOCATION SET LOC_RK_CODE = '41303029' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Chiracha Wanbari';

UPDATE LOCATION SET LOC_RK_CODE = '41303036' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Ilala Kersa';
UPDATE LOCATION SET LOC_RK_CODE = '41303016' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Tombe Anchebi';
UPDATE LOCATION SET LOC_RK_CODE = '41303004' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Senkele Ale Mariyam';
UPDATE LOCATION SET LOC_RK_CODE = '41303009' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Sombo Yabeta';
UPDATE LOCATION SET LOC_RK_CODE = '41303023' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Waranen Megnako';
UPDATE LOCATION SET LOC_RK_CODE = '41303006' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Wolisoma';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 01';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 03';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 02';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 05';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 04';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 06';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 07';
UPDATE LOCATION SET LOC_RK_CODE = '4110301' WHERE LOC_CITY = 'Wolisso Town' and LOC_ADDRESS = 'Kebele 08';

UPDATE LOCATION SET LOC_RK_CODE = '41308013' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Alenu Shenkora';
UPDATE LOCATION SET LOC_RK_CODE = '41308005' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Besi Bilda';
UPDATE LOCATION SET LOC_RK_CODE = '41308004' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Besi Abukeiku';
UPDATE LOCATION SET LOC_RK_CODE = '41308010' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Bili Malima';
UPDATE LOCATION SET LOC_RK_CODE = '41308014' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Golole Temssa';
UPDATE LOCATION SET LOC_RK_CODE = '41308017' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'K/Mariyam';
UPDATE LOCATION SET LOC_RK_CODE = '41308019' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'M/T/cherfa';
UPDATE LOCATION SET LOC_RK_CODE = '41308020' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'M/S Botonei';
UPDATE LOCATION SET LOC_RK_CODE = '41308016' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'T/Yaya';

-- after Abebe check
UPDATE LOCATION SET LOC_RK_CODE='41301033' WHERE LOC_CITY = 'Amaya' and LOC_ADDRESS = 'Etetya Jafitinibo';
UPDATE LOCATION SET LOC_RK_CODE='4041101' WHERE LOC_CITY = 'Jimma' and LOC_ADDRESS = 'Asendabo Town';
UPDATE LOCATION SET LOC_RK_CODE='4130501' WHERE LOC_CITY = 'Becho' and LOC_ADDRESS = 'Asgori Town';
UPDATE LOCATION SET LOC_RK_CODE='41309012' WHERE LOC_CITY = 'Becho' and LOC_ADDRESS = 'Batu Cherecha';
UPDATE LOCATION SET LOC_RK_CODE='40507002' WHERE LOC_CITY = 'Dano' and LOC_ADDRESS = 'Dano Shenen';
UPDATE LOCATION SET LOC_RK_CODE='4130401' WHERE LOC_CITY = 'Dawo' and LOC_ADDRESS = 'Busa Town';
UPDATE LOCATION SET LOC_RK_CODE='70104004' WHERE LOC_CITY = 'Kokir Gedebano' and LOC_ADDRESS = 'Deneba';
UPDATE LOCATION SET LOC_RK_CODE='70104022' WHERE LOC_CITY = 'Kokir Gedebano' and LOC_ADDRESS = 'Fite';
UPDATE LOCATION SET LOC_RK_CODE='41305009' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Amido Kuncho';
UPDATE LOCATION SET LOC_RK_CODE='41305013' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Bili';
UPDATE LOCATION SET LOC_RK_CODE='41305011' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Dugda Lugo';
UPDATE LOCATION SET LOC_RK_CODE='41305004' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Golole Kiltu';
UPDATE LOCATION SET LOC_RK_CODE='41305003' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Goro Kurkurfa';
UPDATE LOCATION SET LOC_RK_CODE='41305007' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Jigdu Mida';
UPDATE LOCATION SET LOC_RK_CODE='41305001' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Keta Andode';
UPDATE LOCATION SET LOC_RK_CODE='41305017' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Keta Asgori';
UPDATE LOCATION SET LOC_RK_CODE='41305018' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Kule Gefersa';
UPDATE LOCATION SET LOC_RK_CODE='41305005' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Mulu Satey';
UPDATE LOCATION SET LOC_RK_CODE='41305002' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Senibo Goro';
UPDATE LOCATION SET LOC_RK_CODE='41305012' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Buti Teglo';
UPDATE LOCATION SET LOC_RK_CODE='41305014' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Tulu Mangura';
UPDATE LOCATION SET LOC_RK_CODE='41305006' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Wereso Kolina';
UPDATE LOCATION SET LOC_RK_CODE='41305016' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Wasarbi Basi';
UPDATE LOCATION SET LOC_RK_CODE='41305015' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Woserbi Nado';
UPDATE LOCATION SET LOC_RK_CODE='40403003' WHERE LOC_CITY = 'Jimma' and LOC_ADDRESS = 'Gibei';
UPDATE LOCATION SET LOC_RK_CODE='41312018' WHERE LOC_CITY = 'Goro' and LOC_ADDRESS = 'Abadho Bukasa';
UPDATE LOCATION SET LOC_RK_CODE='41312014' WHERE LOC_CITY = 'Goro' and LOC_ADDRESS = 'Adami Wadesa';
UPDATE LOCATION SET LOC_RK_CODE='41312016' WHERE LOC_CITY = 'Goro' and LOC_ADDRESS = 'Fenchir Ambabesa';
UPDATE LOCATION SET LOC_RK_CODE='41312011' WHERE LOC_CITY = 'Goro' and LOC_ADDRESS = 'Sinano Amanya Gute';
UPDATE LOCATION SET LOC_RK_CODE='40508401' WHERE LOC_CITY = 'Nono' and LOC_ADDRESS = 'Hurumukorke';
UPDATE LOCATION SET LOC_RK_CODE='40508020' WHERE LOC_CITY = 'Nono' and LOC_ADDRESS = 'Metusilase';
UPDATE LOCATION SET LOC_RK_CODE='40508027' WHERE LOC_CITY = 'Nono' and LOC_ADDRESS = 'Nono Qondala';
UPDATE LOCATION SET LOC_RK_CODE='4131401' WHERE LOC_CITY = 'Sebeta' and LOC_ADDRESS = 'Sebeta';
UPDATE LOCATION SET LOC_RK_CODE='41310001' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Aebisa Leku Gidawa';
UPDATE LOCATION SET LOC_RK_CODE='41310010' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Gidano Dalota';
UPDATE LOCATION SET LOC_RK_CODE='41310003' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Aurago Kelcha';
UPDATE LOCATION SET LOC_RK_CODE='41310021' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Tawocha Wechanchr';
UPDATE LOCATION SET LOC_RK_CODE='41310019' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Yimer Amba Washenba';
UPDATE LOCATION SET LOC_RK_CODE='4131301' WHERE LOC_CITY = 'Sodo Dachi' and LOC_ADDRESS = 'Tere Town';
UPDATE LOCATION SET LOC_RK_CODE='4040301' WHERE LOC_CITY = 'Sokoru' and LOC_ADDRESS = 'Sokoru Town';
UPDATE LOCATION SET LOC_RK_CODE='4130502' WHERE LOC_CITY = 'Elu' and LOC_ADDRESS = 'Teji Town';
UPDATE LOCATION SET LOC_RK_CODE='41308012' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Habebe Silasena Gichila';
UPDATE LOCATION SET LOC_RK_CODE='41308006' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Jawaro Kera';
UPDATE LOCATION SET LOC_RK_CODE='40415007' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Lege boter';
UPDATE LOCATION SET LOC_RK_CODE='40516038' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Mendida Sole';
UPDATE LOCATION SET LOC_RK_CODE='41308003' WHERE LOC_CITY = 'Tole' and LOC_ADDRESS = 'Sobo Chancho';
UPDATE LOCATION SET LOC_RK_CODE='41303019' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Kenyira Lebu';
UPDATE LOCATION SET LOC_RK_CODE='41302008' WHERE LOC_CITY = 'Wonchi' and LOC_ADDRESS = 'Chebose Seleten';
UPDATE LOCATION SET LOC_RK_CODE='41302023' WHERE LOC_CITY = 'Wonchi' and LOC_ADDRESS = 'Echade Bidibe';
UPDATE LOCATION SET LOC_RK_CODE='41302019' WHERE LOC_CITY = 'Wonchi' and LOC_ADDRESS = 'Lemen Metahora';
UPDATE LOCATION SET LOC_RK_CODE='41302015' WHERE LOC_CITY = 'Wonchi' and LOC_ADDRESS = 'Meti Welga';
UPDATE LOCATION SET LOC_RK_CODE='41302006' WHERE LOC_CITY = 'Wonchi' and LOC_ADDRESS = 'Wendo Talfe';
UPDATE LOCATION SET LOC_RK_CODE='41301018' WHERE LOC_CITY = 'Amaya' and LOC_ADDRESS = 'Denkaka Odu Bari';
UPDATE LOCATION SET LOC_RK_CODE='41309002' WHERE LOC_CITY = 'Becho' and LOC_ADDRESS = 'Awash Bune';
UPDATE LOCATION SET LOC_RK_CODE='7011001' WHERE LOC_CITY = 'Cheha' and LOC_ADDRESS = 'Imdibir Town';
UPDATE LOCATION SET LOC_RK_CODE='7011101' WHERE LOC_CITY = 'Enmur' and LOC_ADDRESS = 'Gunchirei';
UPDATE LOCATION SET LOC_RK_CODE='40415004' WHERE LOC_CITY = 'Chora Boter' and LOC_ADDRESS = 'Kemasogola';
UPDATE LOCATION SET LOC_RK_CODE='40508008' WHERE LOC_CITY = 'Nono' and LOC_ADDRESS = 'Chando';
UPDATE LOCATION SET LOC_RK_CODE='41310017' WHERE LOC_CITY = 'Seden Sodo' and LOC_ADDRESS = 'Ejoy Eskedey';
UPDATE LOCATION SET LOC_RK_CODE='41304008' WHERE LOC_CITY = 'Dawo' and LOC_ADDRESS = 'Dima Jeliwan';
UPDATE LOCATION SET LOC_RK_CODE='41304021' WHERE LOC_CITY = 'Dawo' and LOC_ADDRESS = 'Dawo Seden';
UPDATE LOCATION SET LOC_RK_CODE='41313004' WHERE LOC_CITY = 'Sodo Dachi' and LOC_ADDRESS = 'Weni Oda Leqa';
UPDATE LOCATION SET LOC_RK_CODE='41303024' WHERE LOC_CITY = 'Wolisso Rural' and LOC_ADDRESS = 'Leman Ayitu';
UPDATE LOCATION SET LOC_RK_CODE='7011401' WHERE LOC_CITY = 'Wolkite' and LOC_ADDRESS = 'Wolkite Town';
UPDATE LOCATION SET LOC_RK_CODE='7011401' WHERE LOC_CITY = 'Wolkite'; -- all under wolkite share same code

-- fixing wrong previous
UPDATE LOCATION SET LOC_RK_CODE = NULL WHERE (LOC_CITY = 'Ginde Beret') and (LOC_ADDRESS = 'Ginde Beret');
UPDATE LOCATION SET LOC_RK_CODE = NULL WHERE (LOC_CITY = 'Tole') and (LOC_ADDRESS = 'Alengo Tullu');
UPDATE LOCATION SET LOC_RK_CODE = NULL WHERE (LOC_CITY = 'Goro') and (LOC_ADDRESS = 'Keinteiro Bido');
UPDATE LOCATION SET LOC_RK_CODE= NULL WHERE LOC_CITY = 'Adama' and LOC_ADDRESS = '';

-- set W_CODE (first 5 digits of RK_CODE)
UPDATE LOCATION SET LOC_W_CODE=70102 WHERE LOC_CITY='Abeshegei';
UPDATE LOCATION SET LOC_W_CODE=41301 WHERE LOC_CITY='Amaya';
UPDATE LOCATION SET LOC_W_CODE=40515 WHERE LOC_CITY='Ambo';
UPDATE LOCATION SET LOC_W_CODE=41309 WHERE LOC_CITY='Becho';
UPDATE LOCATION SET LOC_W_CODE=41304 WHERE LOC_CITY='Dawo';
UPDATE LOCATION SET LOC_W_CODE=40510 WHERE LOC_CITY='Dendi';
UPDATE LOCATION SET LOC_W_CODE=40501 WHERE LOC_CITY='Ginde Beret';
UPDATE LOCATION SET LOC_W_CODE=41312 WHERE LOC_CITY='Goro';
UPDATE LOCATION SET LOC_W_CODE=40415 WHERE LOC_CITY='Chora Boter';
UPDATE LOCATION SET LOC_W_CODE=41307 WHERE LOC_CITY='Kersa Malima';
UPDATE LOCATION SET LOC_W_CODE=40508 WHERE LOC_CITY='Nono';
UPDATE LOCATION SET LOC_W_CODE=41310 WHERE LOC_CITY='Seden Sodo';
UPDATE LOCATION SET LOC_W_CODE=41308 WHERE LOC_CITY='Tole';
UPDATE LOCATION SET LOC_W_CODE=41303 WHERE LOC_CITY='Wolisso Rural';
UPDATE LOCATION SET LOC_W_CODE=41311 WHERE LOC_CITY='Wolisso Town';
UPDATE LOCATION SET LOC_W_CODE=41302 WHERE LOC_CITY='Wonchi';
UPDATE LOCATION SET LOC_W_CODE=40516 WHERE LOC_CITY='Abuna Ginde Beret';
UPDATE LOCATION SET LOC_W_CODE=140101 WHERE LOC_CITY='Adis Ababa';
UPDATE LOCATION SET LOC_W_CODE=70110 WHERE LOC_CITY='Cheha';
UPDATE LOCATION SET LOC_W_CODE=40507 WHERE LOC_CITY='Dano';
UPDATE LOCATION SET LOC_W_CODE=70111 WHERE LOC_CITY='Enmur';
UPDATE LOCATION SET LOC_W_CODE=40520 WHERE LOC_CITY='Holeta';
UPDATE LOCATION SET LOC_W_CODE=40502 WHERE LOC_CITY='Jeldu';
UPDATE LOCATION SET LOC_W_CODE=70101 WHERE LOC_CITY='Kabena';
UPDATE LOCATION SET LOC_W_CODE=70104 WHERE LOC_CITY='Kokir Gedebano';
UPDATE LOCATION SET LOC_W_CODE=41313 WHERE LOC_CITY='Sodo Dachi';
UPDATE LOCATION SET LOC_W_CODE=40403 WHERE LOC_CITY='Sokoru';
UPDATE LOCATION SET LOC_W_CODE=70114 WHERE LOC_CITY='Wolkite';
UPDATE LOCATION SET LOC_W_CODE=41305 WHERE LOC_CITY='Elu';
UPDATE LOCATION SET LOC_W_CODE=70103 WHERE LOC_CITY='Ezha';
UPDATE LOCATION SET LOC_W_CODE=70109 WHERE LOC_CITY='Gumer';
UPDATE LOCATION SET LOC_W_CODE=70112 WHERE LOC_CITY='Muhur';
