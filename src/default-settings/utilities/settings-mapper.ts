import { AppSettings } from '../schemas/app-settings.schema';
import { constantsAppSettings, SETTING_STRIPE_SECRET, SETTING_STRIPE_WEBHOOK, SETTING_STRIPE_SUCCESS_URL, SETTING_STRIPE_CANCEL_URL, SETTING_SUBMISSION_FEE, SETTING_FUND_TOTAL } from '../../shared/consts';

export class SettingsMapper {
    static mapSettings(listSettings: AppSettings[]) {
        const settings = constantsAppSettings;
        for (const setting of listSettings) {
            switch (setting.attribute) {
                case SETTING_STRIPE_SECRET:
                    settings.stripeSecretKey = setting.value;
                    break;
                case SETTING_STRIPE_WEBHOOK:
                    settings.stripeWebhookSecret = setting.value;
                    break;
                case SETTING_STRIPE_SUCCESS_URL:
                    settings.stripeSuccessUrl = setting.value;
                    break;
                case SETTING_STRIPE_CANCEL_URL:
                    settings.stripeCancelUrl = setting.value;
                    break;
                case SETTING_SUBMISSION_FEE:
                    settings.submissionFee = parseFloat(setting.value);
                    break;
                case SETTING_FUND_TOTAL:
                    settings.fundTotal = parseFloat(setting.value);
                    break;
            }
        }
    }
}