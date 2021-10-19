import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const messages = { 
    'en': {

        // Table Panel Headers
        stateFlag: 'Etat',
        priority: 'Priority',
        device: 'Device',
        duration: 'Duration',
        ipAddress: 'IP Address',
        indicator: 'Indicator',
        description: 'Description',
        state: 'State*',
        output: 'Output',
        sla: 'SLA',
        site: 'Site',
        type: 'Type',
        lastEv:'Last EV',
        email: 'Email',
        phone: 'Phone',
        debug: 'Debug',
        stateType: 'State Type',
        autoTrack: 'Auto Track',
        track: 'Track',
        checkType: 'cType',
        passiveEnabled: 'Passive',
        checksEnabled: 'Checked',
        recentChange: 'Recent Change',

        // Status labels
        pending: 'Pending',
        serviceOk: 'OK',
        serviceWarning: 'Warning',
        serviceUnknown: 'Unknown',
        serviceObsolete: 'Outage',
        serviceCritical: 'Critical',
        hostUp: 'UP',
        hostDown: 'Down',
        hostUnreachable: 'Unreachable',
        acquitted: 'Acquitted',
        disable: 'Disable',

        // Data table messages
        noDataText: 'Aucune donnée disponible',

        // Dark Mode
        darkModeOn: 'Dark mode On',
        darkModeOff: 'Dark mode Off',

        // Column Manage tooltip
        colorManageTitle: 'Show/Hide columns',

        // Actions Buttons tooltips
        deactiveAlarm: 'Block alarm',
        resetState: 'Reset state',
        acquit: 'Acquit',
        recheck: 'Recheck',
        comment: 'Comment',
        save: 'Save',
        cancel: 'Cancel',
        // Button label
        ok: "OK",

        // Filters
        saveFilter: 'Save this filter',
        filterList: 'Filters',
        filterBoxPlaceholder: 'Enter your filter here',
        filters: {
            all: 'All',
            incident: 'Incident',
            maintenance: 'Maintenance',
            alert: 'Alerts',
            inventaire: 'Inventaire',

            // Nagios filters description
            critical: 'Critical',
            recent: 'Recent',
            known: 'Known',
            allProblems: 'All problems',
            any: 'All elements'
        },
        helpFilterQueryFormat: "Enter here your query. \n" + 
                            "Ex: 'down'",

        // Columns icons
        trackLabel: "Tracked",
        ackLabel: "Ack",
        noTrackLabel: "Not tracked",
        noAckLabel: "Not ack",
    },
    'fr': {

        // Table Panel Headers
        stateFlag: 'Etat',
        priority: 'Priorité',
        device: 'Equipement',
        durationLastStateChange: "Durée changement d'état",
        durationLastUpdate: "Durée depuis dernier changement d'état",
        lastEv: "Date du dernier changement d'état",
        ipAddress: 'Adresse IP',
        indicator: 'Indicateur',
        description: 'Description',
        state: 'Etat*',
        output: 'Sortie',
        sla: 'SLA',
        site: 'Localisation',
        type: 'Type',
        email: 'Adresse électronique',
        phone: 'Téléphone',
        debug: 'Debug',
        ack: 'Ack',
        outage: 'Obsolète',
        stateType: 'Etat type',
        autoTrack: 'Auto tracké',
        track: 'Tracké',
        checkType: 'cType',
        passiveEnabled: 'Passif',
        checksEnabled: 'Testé',
        recentChange: 'Changement Récent',

        // Status labels
        pending: 'En cours',
        serviceOk: 'Valide',
        serviceWarning: 'Attention',
        serviceUnknown: 'Inconnu',
        serviceObsolete: 'Obsolète',
        serviceCritical: 'Critique',
        hostUp: 'Actif',
        hostDown: 'Hors-Service',
        hostUnreachable: 'Injoignable',
        acquitted: 'Acquitté',
        disable: 'Désactivé',

        // Data table messages
        noDataText: 'Aucune donnée disponible',

        // Dark Mode
        darkModeOn: 'Mode nuit activé',
        darkModeOff: 'Mode nuit désactivé',

        // Column Manage tooltip
        colorManageTitle: 'Activer/Désactiver des colonnes',

        // Actions Buttons tooltips
        deactiveAlarm: 'Désactiver les alarmes',
        resetState: 'Réinitialiser les états',
        acquit: 'Acquitter',
        recheck: 'Recheck',
        comment: 'Commenter',
        save: 'Enregistrer',
        cancel: 'Annuler',
        // Button label
        ok: "OK",

        // Filters
        saveFilter: 'Enregistrer ce filtre',
        filterList: 'Filters',
        filterBoxPlaceholder: 'Saisissez ici votre filtre',
        filters: {
            all: 'Tous les éléments',
            incident: 'Incidents',
            maintenance: 'Maintenance',
            alert: 'Alertes',
            inventaire: 'Inventaire',

            // Nagios filters description
            critical: 'Critique',
            recent: 'Récent',
            known: 'Connu',
            allProblems: 'Tous les problèmes',
            any: 'Tous les éléments'
        },
        helpFilterQueryFormat: "Saisissez dans ce champ votre requette. \n" + 
                            "Ex: 'down'",

        // Columns icons
        trackLabel: "Tracké",
        ackLabel: "Acquitté",
        noTrackLabel: "Non tracké",
        noAckLabel: "Non acquitté",
    }
};

const i18n = new VueI18n({  
    locale: 'fr', // set locale    
    fallbackLocale: 'fr', // set fallback locale
    messages, // set locale messages
});

export default i18n;
