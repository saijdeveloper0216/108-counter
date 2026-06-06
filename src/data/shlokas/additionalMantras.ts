import type { ShlokaLanguages } from '../../types/content';

type MantraDraft = {
  id: string;
  title: string;
  languages: ShlokaLanguages;
};

export const additionalShlokas: MantraDraft[] = [
  {
    id: 'gayatri-mantra',
    title: 'Gayatri Mantra',
    languages: {
      sanskrit: [
        'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।',
        'धiyo यो नः प्रचोदयात्॥',
      ],
      hindi: [
        'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।',
        'धiyo यो नः प्रचोदयात्॥',
        'अर्थ: हम उस दिव्य प्रकाश का ध्यान करें जो भू, भुवः और स्वः को स्तंभ देता है, और वह हमारी बुद्धि को प्रेरित करे।',
      ],
      english: [
        'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi,',
        'Dhiyo Yo Nah Prachodayat.',
        'We meditate on the glorious light of Savitr (the Sun), worthy of worship.',
        'May that divine radiance inspire and illumine our intellect.',
      ],
      telugu: [
        'ఓం భూర్భువస్సువః',
        'తత్సవితుర్వరేణ్యం',
        'భర్గోదేవస్య ధీమహి',
        'ధియో యో నః ప్రచోదయాత్',
        'భూమి, ఆకాశం, స్వర్గానికి ఆధారమైన సవితృ దేవuni tejasu ni dhyanistunnamu; ma buddhini prerayinchu manasā.',
      ],
    },
  },
  {
    id: 'om-namah-shivaya',
    title: 'Om Namah Shivaya',
    languages: {
      sanskrit: ['ॐ नमः शिवाय॥'],
      hindi: ['ॐ नमः शिवाय॥', 'अर्थ: भगवान शिव को नमस्कार।'],
      english: ['Om Namah Shivaya.'],
      telugu: ['ఓం నమః శివాయ॥', 'శివuni ki namaskaramulu.'],
    },
  },
  {
    id: 'ganesh-mantra',
    title: 'Ganesh Mantra',
    languages: {
      sanskrit: [
        'ॐ गं गणपतये नमः॥',
        'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।',
        'नirvighnam kuru me deva sarva karyeshu sarvada॥',
      ],
      hindi: [
        'ॐ गं गणपतये नमः॥',
        'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।',
        'नirvighnam kuru me deva sarva karyeshu sarvada॥',
        'हे गणेश, सभी कार्यों में बाधा दूर करें।',
      ],
      english: [
        'Om Gam Ganapataye Namah.',
        'Vakratunda Mahakaya Suryakoti Samaprabha,',
        'Nirvighnam Kuru Me Deva Sarva Karyeshu Sarvada.',
      ],
      telugu: [
        'ఓం గం గణపతయే నమః॥',
        'Vakratunda Mahakaya Suryakoti Samaprabha,',
        'Nirvighnam kuru me deva sarva karyeshu sarvada.',
        'Ganesha, anni panulu nirvighnam ga jaragalani korutunnanu.',
      ],
    },
  },
  {
    id: 'durga-mantra',
    title: 'Durga Mantra',
    languages: {
      sanskrit: [
        'ॐ दुं दुर्गायै नमः॥',
        'सर्वमंगल मांगalye शिवे सर्वार्थ साधike।',
        'शरण्ये त्र्यम्बike गauri नारायणि नमostute॥',
      ],
      hindi: [
        'ॐ दुं दुर्गायै नमः॥',
        'सर्वमंगल मांगalye शिवे सर्वार्थ साधike।',
        'शरण्ये त्र्यम्बike गauri नारायणि नमostute॥',
      ],
      english: [
        'Om Dum Durgayei Namah.',
        'Sarva Mangala Mangalye Shive Sarvartha Sadhike,',
        'Sharanye Tryambake Gauri Narayani Namostute.',
      ],
      telugu: [
        'ఓం దुं దుర్గాయై నమః॥',
        'Sarva mangala mangaly | shive sarvartha sadhike |',
        'Sharanye tryambake Gauri | Narayani namostute |',
      ],
    },
  },
  {
    id: 'vishnu-mantra',
    title: 'Vishnu Mantra',
    languages: {
      sanskrit: [
        'ॐ नमो भगवते वासुदेवाय॥',
        'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम्।',
        'विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्॥',
      ],
      hindi: [
        'ॐ नमो भगवते वासुदेवाय॥',
        'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम्।',
        'विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्॥',
        'अर्थ: भगवान वासुदेव को नमस्कार।',
        'जो शान्त स्वरूप हैं, शेषनाग पर शयन करते हैं, कमलनाभ हैं, देवों के स्वामी हैं,',
        'जो विश्व के आधार हैं, आकाश के समान व्यापक हैं, मेघ के समान वर्ण वाले और शुभ अंग वाले हैं।',
      ],
      english: [
        'Om Namo Bhagavate Vasudevaya.',
        'Shantakaram Bhujaga Shayanam Padmanabham Suresham,',
        'Vishvadharam Gagana Sadrsam Meghavarnam Shubhangam.',
        'Salutations to Lord Vasudeva — serene in form, reclining on the serpent Adisesha,',
        'lotus-naveled, lord of the gods, sustainer of the universe, vast as the sky, cloud-hued and auspicious.',
      ],
      telugu: [
        'ఓం నమో భగవతే వాసుదేవాయ॥',
        'శాంతాకారం భుజగశయనం పద్మనాభం సురేశम्।',
        'విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగम्॥',
        'వాసుదేవ భగవానునికి నమస్కారం — శాంతి స్వరూపుడు, ఆదిశేషుపై శయనం, పద్మ నాభి, దేవాధిపతి,',
        'విశ్వాన్ని ధరించేవాడు, ఆకాశం లాగా వ్యాపకుడు, మేఘం లాంటి వర్ణం కలవాడు.',
      ],
    },
  },
  {
    id: 'saraswati-vandana',
    title: 'Saraswati Vandana',
    languages: {
      sanskrit: [
        'या कुंदendu tushaara haara dhavala।',
        'या shubhra vastravrita।',
        'या veena vara danda manditakara।',
        'या shweta padmasana॥',
        'या brahmachyuta shankara prabhritibhir devaih sada vandita।',
        'सा maam paatu saraswati bhagavati nihshesha jadyapaha॥',
      ],
      hindi: [
        'जो कुंद-सफेद वस्त्र धारण करती हैं, वीणा धारिणी,',
        'जिन्हें ब्रह्मा, विष्णु, शंकर सदा वंदित करते हैं,',
        'वह भगवती सरस्वती मेरे अज्ञान को दूर करें।',
      ],
      english: [
        'Ya Kundendu Tushara Hara Dhavala, Ya Shubhra Vastravrita,',
        'Ya Veena Vara Danda Manditakara, Ya Shweta Padmasana,',
        'Ya Brahmachyuta Shankara Prabhritibhir Devaih Sada Vandita,',
        'Sa Maam Patu Saraswati Bhagavati Nihshesha Jadyapaha.',
      ],
      telugu: [
        'Kundendu tushka vanti teja, veena dharini,',
        'Brahma Vishnu Shankarula vandita,',
        'Saraswati devi naa ajnanam teeyagalaraani korika.',
      ],
    },
  },
  {
    id: 'shanti-mantra',
    title: 'Shanti Mantra',
    languages: {
      sanskrit: [
        'ॐ sarve bhavantu sukhinah sarve santu niramayah।',
        'sarve bhadrani pashyantu ma kashcid duhkha bhag bhavet॥',
        'Om shantih shantih shantih॥',
      ],
      hindi: [
        'सभी सुखी हों, सभी निरोग हों, सभी कल्याण देखें,',
        'कोई भी दुःख का भागी न बने। ॐ शान्तिः शान्तिः शान्तिः॥',
      ],
      english: [
        'Om Sarve Bhavantu Sukhinah Sarve Santu Niramayah,',
        'Sarve Bhadrani Pashyantu Ma Kashcid Duhkha Bhag Bhavet,',
        'Om Shantih Shantih Shantih.',
      ],
      telugu: [
        'Andariki sukham kalugutoo, andaru arogyamga undali,',
        'dukkhamu lekunda shanti labhistoo.',
        'Om shantih shantih shantih.',
      ],
    },
  },
  {
    id: 'lalitha-panchakshari',
    title: 'Lalitha Panchakshari',
    languages: {
      sanskrit: ['ॐ hrīm shrim lalitayai namah॥'],
      hindi: ['ॐ ह्रीं श्रीं लalitayai नमः॥', 'देवी लalita को नमस्कार।'],
      english: ['Om Hreem Shreem Lalitayai Namah.'],
      telugu: ['ఓం హ్రీం శ్రీం లalitayai నమః॥', 'Lalita Devi ki namaskaramulu.'],
    },
  },
];
