# chatbot_flow.py

chatbot_flows = {
    "start": {
        "message": {
            "ar": "👋 أهلاً وسهلاً 👋\nاختر من الخيارات التالية:\n\n1️⃣ الخدمات المتاحة\n2️⃣ إنشاء حساب / تسجيل دخول\n3️⃣ عروض وخصومات\n4️⃣ معلومات عن الشركة\n5️⃣ التواصل مع الدعم\n6️⃣ خدماتك سوشال",
            "en": "👋 Welcome! 👋\nChoose from the following options:\n\n1️⃣ Available Services\n2️⃣ Create Account / Login\n3️⃣ Offers & Discounts\n4️⃣ Company Information\n5️⃣ Contact Support\n6️⃣ Our Social Media"
        },
        "options": {
            "1": "services_available",
            "1️⃣": "services_available",
            "الخدمات المتاحة": "services_available",
            "خدمات": "services_available",
            "Available Services": "services_available",
            "Services": "services_available",
            "2": "account_login",
            "2️⃣": "account_login",
            "إنشاء حساب": "account_login",
            "تسجيل دخول": "account_login",
            "حساب": "account_login",
            "Create Account": "account_login",
            "Login": "account_login",
            "Account": "account_login",
            "3": "offers_discounts",
            "3️⃣": "offers_discounts",
            "عروض": "offers_discounts",
            "خصومات": "offers_discounts",
            "Offers": "offers_discounts",
            "Discounts": "offers_discounts",
            "4": "company_info",
            "4️⃣": "company_info",
            "معلومات": "company_info",
            "الشركة": "company_info",
            "Company Information": "company_info",
            "Information": "company_info",
            "5": "contact_support",
            "5️⃣": "contact_support",
            "التواصل": "contact_support",
            "الدعم": "contact_support",
            "Contact Support": "contact_support",
            "Support": "contact_support",
            "6": "social_media",
            "6️⃣": "social_media",
            "سوشال": "social_media",
            "Social Media": "social_media",
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "services_available": {
        "message": {
            "ar": "1️⃣ الخدمات المتاحة\n\n1️⃣ 🔧 سباكة\n2️⃣ ⚡ كهرباء\n3️⃣ 🔨 نجارة\n4️⃣ 🧹 تنظيف\n5️⃣ 🔌 صيانة أجهزة",
            "en": "1️⃣ Available Services\n\n1️⃣ 🔧 Plumbing\n2️⃣ ⚡ Electricity\n3️⃣ 🔨 Carpentry\n4️⃣ 🧹 Cleaning\n5️⃣ 🔌 Device Repair"
        },
        "options": {
            "1": "plumbing",
            "1️⃣": "plumbing",
            "سباكة": "plumbing",
            "Plumbing": "plumbing",
            "2": "electricity", 
            "2️⃣": "electricity",
            "كهرباء": "electricity",
            "Electricity": "electricity",
            "3": "carpentry",
            "3️⃣": "carpentry",
            "نجارة": "carpentry",
            "Carpentry": "carpentry",
            "4": "cleaning",
            "4️⃣": "cleaning",
            "تنظيف": "cleaning",
            "Cleaning": "cleaning",
            "5": "device_repair",
            "5️⃣": "device_repair",
            "صيانة أجهزة": "device_repair",
            "صيانة": "device_repair",
            "Device Repair": "device_repair",
            "Repair": "device_repair",
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "plumbing": {
        "message": {
            "ar": "🔧 خدمات السباكة\n\n1️⃣ • تصليح حوض\n2️⃣ • تسليك مجاري\n3️⃣ • تركيب صنابير\n4️⃣ • إصلاح تسريب\n5️⃣ • تركيب سخان\n6️⃣ • إصلاح مرحاض\n7️⃣ • تركيب حوض جديد\n8️⃣ • إصلاح أنابيب",
            "en": "🔧 Plumbing Services\n\n1️⃣ • Sink Repair\n2️⃣ • Drain Unclogging\n3️⃣ • Faucet Installation\n4️⃣ • Leak Repair\n5️⃣ • Heater Installation\n6️⃣ • Toilet Repair\n7️⃣ • New Sink Installation\n8️⃣ • Pipe Repair"
        },
        "options": {
            "1": "repair_sink",
            "1️⃣": "repair_sink",
            "تصليح حوض": "repair_sink",
            "حوض": "repair_sink",
            "Sink Repair": "repair_sink",
            "Sink": "repair_sink",
            "2": "unclog_drain",
            "2️⃣": "unclog_drain",
            "تسليك مجاري": "unclog_drain",
            "تسليك": "unclog_drain",
            "Drain Unclogging": "unclog_drain",
            "Drain": "unclog_drain",
            "3": "install_faucets",
            "3️⃣": "install_faucets",
            "تركيب صنابير": "install_faucets",
            "صنابير": "install_faucets",
            "Faucet Installation": "install_faucets",
            "Faucet": "install_faucets",
            "4": "fix_leak",
            "4️⃣": "fix_leak",
            "إصلاح تسريب": "fix_leak",
            "تسريب": "fix_leak",
            "Leak Repair": "fix_leak",
            "Leak": "fix_leak",
            "5": "install_heater",
            "5️⃣": "install_heater",
            "تركيب سخان": "install_heater",
            "سخان": "install_heater",
            "Heater Installation": "install_heater",
            "Heater": "install_heater",
            "6": "fix_toilet",
            "6️⃣": "fix_toilet",
            "إصلاح مرحاض": "fix_toilet",
            "مرحاض": "fix_toilet",
            "Toilet Repair": "fix_toilet",
            "Toilet": "fix_toilet",
            "7": "install_sink",
            "7️⃣": "install_sink",
            "تركيب حوض": "install_sink",
            "New Sink Installation": "install_sink",
            "8": "fix_pipes",
            "8️⃣": "fix_pipes",
            "إصلاح أنابيب": "fix_pipes",
            "أنابيب": "fix_pipes",
            "Pipe Repair": "fix_pipes",
            "Pipes": "fix_pipes",
            "عودة": "services_available",
            "رجوع": "services_available",
            "back": "services_available",
            "return": "services_available",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "electricity": {
        "message": {
            "ar": "⚡ خدمات الكهرباء\n\n1️⃣ • إصلاح كهرباء\n2️⃣ • تركيب مروحة\n3️⃣ • إصلاح مكيف\n4️⃣ • تركيب إضاءة\n5️⃣ • إصلاح سخان كهربائي\n6️⃣ • تركيب مفتاح\n7️⃣ • إصلاح فيوز\n8️⃣ • تركيب كابل",
            "en": "⚡ Electricity Services\n\n1️⃣ • Electrical Repair\n2️⃣ • Fan Installation\n3️⃣ • AC Repair\n4️⃣ • Lighting Installation\n5️⃣ • Electric Heater Repair\n6️⃣ • Switch Installation\n7️⃣ • Fuse Repair\n8️⃣ • Cable Installation"
        },
        "options": {
            "1": "fix_electricity",
            "1️⃣": "fix_electricity",
            "إصلاح كهرباء": "fix_electricity",
            "كهرباء": "fix_electricity",
            "Electrical Repair": "fix_electricity",
            "Electricity": "fix_electricity",
            "2": "install_fan",
            "2️⃣": "install_fan",
            "تركيب مروحة": "install_fan",
            "مروحة": "install_fan",
            "Fan Installation": "install_fan",
            "Fan": "install_fan",
            "3": "fix_ac",
            "3️⃣": "fix_ac",
            "إصلاح مكيف": "fix_ac",
            "مكيف": "fix_ac",
            "AC Repair": "fix_ac",
            "AC": "fix_ac",
            "4": "install_lighting",
            "4️⃣": "install_lighting",
            "تركيب إضاءة": "install_lighting",
            "إضاءة": "install_lighting",
            "Lighting Installation": "install_lighting",
            "Lighting": "install_lighting",
            "5": "fix_electric_heater",
            "5️⃣": "fix_electric_heater",
            "إصلاح سخان كهربائي": "fix_electric_heater",
            "سخان كهربائي": "fix_electric_heater",
            "Electric Heater Repair": "fix_electric_heater",
            "Heater": "fix_electric_heater",
            "6": "install_switch",
            "6️⃣": "install_switch",
            "تركيب مفتاح": "install_switch",
            "مفتاح": "install_switch",
            "Switch Installation": "install_switch",
            "Switch": "install_switch",
            "7": "fix_fuse",
            "7️⃣": "fix_fuse",
            "إصلاح فيوز": "fix_fuse",
            "فيوز": "fix_fuse",
            "Fuse Repair": "fix_fuse",
            "Fuse": "fix_fuse",
            "8": "install_cable",
            "8️⃣": "install_cable",
            "تركيب كابل": "install_cable",
            "كابل": "install_cable",
            "Cable Installation": "install_cable",
            "Cable": "install_cable",
            "عودة": "services_available",
            "رجوع": "services_available",
            "back": "services_available",
            "return": "services_available",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "cleaning": {
        "message": {
            "ar": "🧹 خدمات التنظيف\n\n1️⃣ • تنظيف منزل\n2️⃣ • تنظيف مكتب\n3️⃣ • تنظيف سجاد\n4️⃣ • تنظيف زجاج\n5️⃣ • تنظيف بعد بناء\n6️⃣ • تنظيف مطبخ\n7️⃣ • تنظيف حمام\n8️⃣ • تنظيف شقة",
            "en": "🧹 Cleaning Services\n\n1️⃣ • House Cleaning\n2️⃣ • Office Cleaning\n3️⃣ • Carpet Cleaning\n4️⃣ • Window Cleaning\n5️⃣ • Post-Construction Cleaning\n6️⃣ • Kitchen Cleaning\n7️⃣ • Bathroom Cleaning\n8️⃣ • Apartment Cleaning"
        },
        "options": {
            "1": "house_cleaning",
            "1️⃣": "house_cleaning",
            "تنظيف منزل": "house_cleaning",
            "منزل": "house_cleaning",
            "House Cleaning": "house_cleaning",
            "House": "house_cleaning",
            "2": "office_cleaning",
            "2️⃣": "office_cleaning",
            "تنظيف مكتب": "office_cleaning",
            "مكتب": "office_cleaning",
            "Office Cleaning": "office_cleaning",
            "Office": "office_cleaning",
            "3": "carpet_cleaning",
            "3️⃣": "carpet_cleaning",
            "تنظيف سجاد": "carpet_cleaning",
            "سجاد": "carpet_cleaning",
            "Carpet Cleaning": "carpet_cleaning",
            "Carpet": "carpet_cleaning",
            "4": "window_cleaning",
            "4️⃣": "window_cleaning",
            "تنظيف زجاج": "window_cleaning",
            "زجاج": "window_cleaning",
            "Window Cleaning": "window_cleaning",
            "Window": "window_cleaning",
            "5": "post_construction_cleaning",
            "5️⃣": "post_construction_cleaning",
            "تنظيف بعد بناء": "post_construction_cleaning",
            "بعد بناء": "post_construction_cleaning",
            "Post-Construction Cleaning": "post_construction_cleaning",
            "Construction": "post_construction_cleaning",
            "6": "kitchen_cleaning",
            "6️⃣": "kitchen_cleaning",
            "تنظيف مطبخ": "kitchen_cleaning",
            "مطبخ": "kitchen_cleaning",
            "Kitchen Cleaning": "kitchen_cleaning",
            "Kitchen": "kitchen_cleaning",
            "7": "bathroom_cleaning",
            "7️⃣": "bathroom_cleaning",
            "تنظيف حمام": "bathroom_cleaning",
            "حمام": "bathroom_cleaning",
            "Bathroom Cleaning": "bathroom_cleaning",
            "Bathroom": "bathroom_cleaning",
            "8": "apartment_cleaning",
            "8️⃣": "apartment_cleaning",
            "تنظيف شقة": "apartment_cleaning",
            "شقة": "apartment_cleaning",
            "Apartment Cleaning": "apartment_cleaning",
            "Apartment": "apartment_cleaning",
            "عودة": "services_available",
            "رجوع": "services_available",
            "back": "services_available",
            "return": "services_available",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "device_repair": {
        "message": {
            "ar": "🔌 صيانة الأجهزة\n\n1️⃣ • ثلاجة\n2️⃣ • غسالة\n3️⃣ • مكيف\n4️⃣ • تلفزيون\n5️⃣ • ميكروويف\n6️⃣ • سخان\n7️⃣ • مروحة\n8️⃣ • خلاط",
            "en": "🔌 Device Repair\n\n1️⃣ • Refrigerator\n2️⃣ • Washing Machine\n3️⃣ • AC\n4️⃣ • TV\n5️⃣ • Microwave\n6️⃣ • Heater\n7️⃣ • Fan\n8️⃣ • Blender"
        },
        "options": {
            "1": "refrigerator_repair",
            "1️⃣": "refrigerator_repair",
            "ثلاجة": "refrigerator_repair",
            "Refrigerator": "refrigerator_repair",
            "2": "washing_machine_repair",
            "2️⃣": "washing_machine_repair",
            "غسالة": "washing_machine_repair",
            "Washing Machine": "washing_machine_repair",
            "3": "ac_repair",
            "3️⃣": "ac_repair",
            "مكيف": "ac_repair",
            "AC": "ac_repair",
            "4": "tv_repair",
            "4️⃣": "tv_repair",
            "تلفزيون": "tv_repair",
            "TV": "tv_repair",
            "5": "microwave_repair",
            "5️⃣": "microwave_repair",
            "ميكروويف": "microwave_repair",
            "Microwave": "microwave_repair",
            "6": "heater_repair",
            "6️⃣": "heater_repair",
            "سخان": "heater_repair",
            "Heater": "heater_repair",
            "7": "fan_repair",
            "7️⃣": "fan_repair",
            "مروحة": "fan_repair",
            "Fan": "fan_repair",
            "8": "blender_repair",
            "8️⃣": "blender_repair",
            "خلاط": "blender_repair",
            "Blender": "blender_repair",
            "عودة": "services_available",
            "رجوع": "services_available",
            "back": "services_available",
            "return": "services_available",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "carpentry": {
        "message": {
            "ar": "🔨 خدمات النجارة\n\n1️⃣ • صنع أثاث\n2️⃣ • إصلاح كرسي\n3️⃣ • تركيب باب\n4️⃣ • إصلاح نافذة\n5️⃣ • صنع رف\n6️⃣ • إصلاح طاولة\n7️⃣ • تركيب دولاب\n8️⃣ • إصلاح سرير",
            "en": "🔨 Carpentry Services\n\n1️⃣ • Furniture Making\n2️⃣ • Chair Repair\n3️⃣ • Door Installation\n4️⃣ • Window Repair\n5️⃣ • Shelf Making\n6️⃣ • Table Repair\n7️⃣ • Wardrobe Installation\n8️⃣ • Bed Repair"
        },
        "options": {
            "1": "make_furniture",
            "1️⃣": "make_furniture",
            "صنع أثاث": "make_furniture",
            "أثاث": "make_furniture",
            "Furniture Making": "make_furniture",
            "Furniture": "make_furniture",
            "2": "fix_chair",
            "2️⃣": "fix_chair",
            "إصلاح كرسي": "fix_chair",
            "كرسي": "fix_chair",
            "Chair Repair": "fix_chair",
            "Chair": "fix_chair",
            "3": "install_door",
            "3️⃣": "install_door",
            "تركيب باب": "install_door",
            "باب": "install_door",
            "Door Installation": "install_door",
            "Door": "install_door",
            "4": "fix_window",
            "4️⃣": "fix_window",
            "إصلاح نافذة": "fix_window",
            "نافذة": "fix_window",
            "Window Repair": "fix_window",
            "Window": "fix_window",
            "5": "make_shelf",
            "5️⃣": "make_shelf",
            "صنع رف": "make_shelf",
            "رف": "make_shelf",
            "Shelf Making": "make_shelf",
            "Shelf": "make_shelf",
            "6": "fix_table",
            "6️⃣": "fix_table",
            "إصلاح طاولة": "fix_table",
            "طاولة": "fix_table",
            "Table Repair": "fix_table",
            "Table": "fix_table",
            "7": "install_wardrobe",
            "7️⃣": "install_wardrobe",
            "تركيب دولاب": "install_wardrobe",
            "دولاب": "install_wardrobe",
            "Wardrobe Installation": "install_wardrobe",
            "Wardrobe": "install_wardrobe",
            "8": "fix_bed",
            "8️⃣": "fix_bed",
            "إصلاح سرير": "fix_bed",
            "سرير": "fix_bed",
            "Bed Repair": "fix_bed",
            "Bed": "fix_bed",
            "عودة": "services_available",
            "رجوع": "services_available",
            "back": "services_available",
            "return": "services_available",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "account_login": {
        "message": {
            "ar": "2️⃣ إنشاء حساب / تسجيل دخول\n\n1️⃣ إنشاء حساب\n2️⃣ تسجيل دخول",
            "en": "2️⃣ Sign up / Login\n\n1️⃣ Sign Up\n2️⃣ Login"
        },
        "options": {
            "1": "create_account",
            "1️⃣": "create_account",
            "إنشاء حساب": "create_account",
            "Sign Up": "create_account",
            "2": "login",
            "2️⃣": "login",
            "تسجيل دخول": "login",
            "دخول": "login",
            "Login": "login",
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "create_account": {
        "message": {
            "ar": "📝 إنشاء حساب جديد\n\nيمكنك إنشاء حساب جديد من خلال الموقع:\n🌐: www.khadamatak.com/register\n\nأو يمكنك التواصل معنا:\n📱: 0123456789\n📧: support@khadamatak.com\n\nهل تحتاج مساعدة أخرى؟",
            "en": "📝 Create New Account\n\nYou can create a new account through the website:\n🌐: www.khadamatak.com/register\n\nOr you can contact us:\n📱: 0123456789\n📧: support@khadamatak.com\n\nDo you need any other help?"
        },
        "options": {
            "عودة": "account_login",
            "رجوع": "account_login",
            "back": "account_login",
            "return": "account_login",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "login": {
        "message": {
            "ar": "🔐 تسجيل الدخول\n\nيمكنك تسجيل الدخول من خلال الموقع:\n🌐: www.khadamatak.com/login\n\nأو يمكنك التواصل معنا:\n📱: 0123456789\n📧: support@khadamatak.com\n\nهل تحتاج مساعدة أخرى؟",
            "en": "🔐 Login\n\nYou can login through the website:\n🌐: www.khadamatak.com/login\n\nOr you can contact us:\n📱: 0123456789\n📧: support@khadamatak.com\n\nDo you need any other help?"
        },
        "options": {
            "عودة": "account_login",
            "رجوع": "account_login",
            "back": "account_login",
            "return": "account_login",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "forgot_password": {
        "message": {
            "ar": "🔑 نسيت كلمة المرور\n\nيمكنك استعادة كلمة المرور من خلال الموقع:\n🌐: www.khadamatak.com/reset-password\n\nأو يمكنك التواصل معنا:\n📱: 0123456789\n📧: support@khadamatak.com\n\nهل تحتاج مساعدة أخرى؟",
            "en": "🔑 Forgot Password\n\nYou can reset your password through the website:\n🌐: www.khadamatak.com/reset-password\n\nOr you can contact us:\n📱: 0123456789\n📧: support@khadamatak.com\n\nDo you need any other help?"
        },
        "options": {
            "عودة": "account_login",
            "رجوع": "account_login",
            "back": "account_login",
            "return": "account_login",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "offers_discounts": {
        "message": {
            "ar": "🎁 العروض والخصومات\n\n✨ عروض حصرية متاحة الآن:\n\n🔥 خصم 20% على أول طلب\n🎯 خصم 15% للعملاء الجدد\n💎 خصم 10% عند طلب أكثر من خدمة\n🏆 برنامج نقاط الولاء",
            "en": "🎁 Offers & Discounts\n\n✨ Exclusive offers available now:\n\n🔥 20% off first order\n🎯 15% off for new customers\n💎 10% off when ordering multiple services\n🏆 Loyalty points program"
        },
        "options": {
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "company_info": {
        "message": {
            "ar": "🏢 معلومات عن الشركة\n\n📍 خدماتك - منصة الخدمات المنزلية الرائدة\n\n🎯 رؤيتنا: تقديم أفضل الخدمات المنزلية بجودة عالية\n\n⭐ خدماتنا:\n• السباكة والكهرباء\n• النظافة والتنظيف\n• النجارة وصيانة الأجهزة\n• وأكثر من 20 خدمة أخرى\n\n🗺️ مناطق الخدمة:\n• القاهرة الكبرى\n• مدن القناة\n• قريباً في جميع محافظات مصر",
            "en": "🏢 Company Information\n\n📍 Khadamatak - Leading Home Services Platform\n\n🎯 Our Vision: Providing the best home services with high quality\n\n⭐ Our Services:\n• Plumbing and Electrical\n• Cleaning Services\n• Carpentry and Device Repair\n• And more than 20 other services\n\n🗺️ Service Areas:\n• Greater Cairo\n• Canal Cities\n• Soon in all Egyptian governorates"
        },
        "options": {
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "contact_support": {
        "message": {
            "ar": "📞 التواصل مع الدعم\n\n📱 0123456789\n📧 support@khadamatak.com\n💬 0123456789\n\n⚡ استجابة سريعة خلال دقائق\n🎯 فريق دعم متخصص\n✅ حلول فورية لجميع الاستفسارات",
            "en": "📞 Contact Support\n\n📱 0123456789\n📧 support@khadamatak.com\n💬 0123456789\n\n⚡ Quick response within minutes\n🎯 Specialized support team\n✅ Instant solutions for all inquiries"
        },
        "options": {
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "social_media": {
        "message": {
            "ar": "📱 خدماتك سوشال\n\n🔗 تابعنا على جميع منصات التواصل:\n\nⓕ فيسبوك: facebook.com/khadamatak\n🅾:instagram.com/khadamatak\n𝕏 تويتر: twitter.com/khadamatak\n▶ youtube.com/khadamatak\n\n✨ اشترك معنا للحصول على:\n• آخر العروض والخصومات\n• نصائح منزلية مفيدة\n• أخبار الخدمات الجديدة",
            "en": "📱 Our Social Media\n\n🔗 Follow us on all platforms:\n\nⓕ Facebook: facebook.com/khadamatak\n🅾:instagram.com/khadamatak\n𝕏 Twitter: twitter.com/khadamatak\n▶ youtube.com/khadamatak\n\n✨ Subscribe with us to get:\n• Latest offers and discounts\n• Useful home tips\n• New services news"
        },
        "options": {
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    "repair_sink": {
        "message": {
            "ar": "🔧 تصليح الحوض\n\nالسعر المتوقع: 500-800 جنيه\nزمن العملية: 2-4 ساعات\n\nهل تريد الحجز؟ (نعم / لا)",
            "en": "🔧 Sink Repair\n\nExpected Price: 500-800 EGP\nProcess Time: 2-4 hours\n\nDo you want to book? (Yes / No)"
        },
        "options": {
            "نعم": "booking_plumbing",
            "لا": "services_available",
            "yes": "booking_plumbing",
            "no": "services_available",
            "Yes": "booking_plumbing",
            "No": "services_available"
        }
    },
    
    # ... (بقية الحالات تبقى كما هي بدون تغيير)
    
    "booking_plumbing": {
        "message": {
            "ar": "✅ تم تأكيد طلبك!\n\nإنشاء طلب مباشرة من الموقع:\n🌐: www.khadamatak.com\n\nللتواصل معنا:\n📱: 0123456789\n📧: support@khadamatak.com\n\nشكراً لاختيارك خدماتك! 😊",
            "en": "✅ Your request has been confirmed!\n\nCreate order directly from the website:\n🌐: www.khadamatak.com\n\nTo contact us:\n📱: 0123456789\n📧: support@khadamatak.com\n\nThank you for choosing our services! 😊"
        },
        "options": {
            "عودة": "start",
            "رجوع": "start",
            "back": "start",
            "return": "start",
            "القائمة الرئيسية": "start",
            "الرئيسية": "start",
            "main menu": "start",
            "home": "start"
        }
    },
    
    # ... (بقية الحالات تبقى كما هي بدون تغيير)
        # End state
    "end": {
        "message": {
            "ar": "شكراً لك! 😊\n\nلو عايز أي حاجة تانية، أنا موجود هنا دائماً!\n\nاكتب 'مرحبا' أو 'start' للبدء من جديد.",
            "en": "Thank you! 😊\n\nIf you need anything else, I'm always here!\n\nType 'hello' or 'start' to start over."
        },
        "options": {
            "مرحبا": "start",
            "start": "start",
            "hello": "start",
            "بداية": "start",
            "جديد": "start",
            "new": "start"
        }
    }
}