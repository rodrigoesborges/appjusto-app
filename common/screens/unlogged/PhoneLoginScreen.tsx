import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import firebase from 'firebase/compat/app';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import * as Sentry from 'sentry-expo';
import { CodeInput } from '../../../courier/approved/ongoing/code-input/CodeInput';
import { t } from '../../../strings';
import { ApiContext, AppDispatch } from '../../app/context';
import DefaultButton from '../../components/buttons/DefaultButton';
import PaddedView from '../../components/containers/PaddedView';
import { phoneFormatter } from '../../components/inputs/pattern-input/formatters';
import { showToast } from '../../store/ui/actions';
import { biggerPadding, colors, doublePadding, padding, screens, texts } from '../../styles';
import { UnloggedParamList } from './types';

type ScreenNavigationProp = StackNavigationProp<UnloggedParamList, 'PhoneLoginScreen'>;
type ScreenRouteProp = RouteProp<UnloggedParamList, 'PhoneLoginScreen'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

type State =
  | 'initial'
  | 'verifying-phone-number'
  | 'phone-number-verified'
  | 'verifying-code'
  | 'error'
  | 'unrecoverable-error'
  | 'success';

export const PhoneLoginScreen = ({ navigation, route }: Props) => {
  // params
  const { phone } = route.params;
  // context
  const dispatch = useDispatch<AppDispatch>();
  const api = React.useContext(ApiContext);
  // state
  const [state, setState] = React.useState<State>('initial');
  const [confirmationResult, setConfirmationResult] =
    React.useState<firebase.auth.ConfirmationResult>();
  const [verificationCode, setVerificationCode] = React.useState('');
  const [error, setError] = React.useState<string>();
  // refs
  const recaptchaRef = React.useRef(null);
  // effects
  React.useEffect(() => {
    if (state === 'success') {
      dispatch(showToast('Validação finalizada com sucesso!', 'success'));
    }
  }, [state]);

  // handlers
  const verifyPhoneHandler = () => {
    setState('verifying-phone-number');
    const phoneProvider = new firebase.auth.PhoneAuthProvider();
    api
      .auth()
      .signInWithPhoneNumber(`+55${phone}`, recaptchaRef.current!)
      .then((result) => {
        setConfirmationResult(result);
        setState('phone-number-verified');
      })
      .catch((error) => {
        console.error(error);
        Sentry.Native.captureException(error);
        setError(t('Não foi possível verificar o telefone. Edite seu perfil e tente novamente.'));
        setState('unrecoverable-error');
      });
  };
  const verifyCodeHandler = () => {
    (async () => {
      try {
        setState('verifying-code');
        const userCredential = await confirmationResult!.confirm(verificationCode);
        if (!userCredential.credential) setState('error');
        else {
          await api.auth().linkCredential(userCredential.credential);
          setState('success');
        }
      } catch (err: any) {
        let message: string = err.message;
        if (message.indexOf('linked to one identity') > 0) {
          message = t(
            'Esse número já está associado à uma outra conta. Edite seu perfil e tente novamente.'
          );
          setState('unrecoverable-error');
        } else {
          if (message.indexOf('SMS code has expired') > 0)
            message = t('O código expirou. Clique em "Enviar novamente" e tente de novo.');
          else if (message.indexOf('phone auth credential is invalid') > 0)
            message = t('O código não é valido. Clique em "Enviar novamente" e tente de novo.');
          setState('error');
        }
        setError(message);
      }
    })();
  };
  // UI
  return (
    <PaddedView
      style={{
        ...screens.centered,
        backgroundColor: colors.grey50,
      }}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={api.getFirebaseOptions()}
        attemptInvisibleVerification={false}
        title={t('Verificação')}
        cancelLabel={t('Cancelar')}
        languageCode="pt"
      />
      {state === 'initial' ? (
        <View>
          <Text style={{ ...texts.x2l }}>{t('Confirme seu celular')}</Text>
          <Text style={{ ...texts.sm, color: colors.grey700, marginTop: padding }}>
            {t(
              'O AppJusto solicita a confirmação do seu celular para combater fraudes e garantir o suporte em caso de incidentes.'
            )}
          </Text>
          <Text style={{ ...texts.sm, color: colors.grey700, marginTop: padding }}>
            {t(
              'Os números de telefone que os usuários fornecem para autenticação serão enviados e armazenados pelo Google para melhorar o seu sistema de prevenção de abuso e spam.'
            )}
          </Text>
          <Text style={{ ...texts.sm, color: colors.grey700, marginTop: padding }}>
            {t(
              'Todos os dados fornecidos pelo usuário serão encriptados, garantindo segurança de ponta-a-ponta no processo de autenticação.'
            )}
          </Text>
          <View style={{ flex: 1 }} />
          <DefaultButton
            style={{ marginVertical: doublePadding }}
            title={t('Enviar código por SMS')}
            onPress={verifyPhoneHandler}
          />
        </View>
      ) : null}
      {state === 'verifying-phone-number' || state === 'verifying-code' ? (
        <ActivityIndicator size="large" color={colors.green500} />
      ) : null}
      {state === 'phone-number-verified' || state === 'error' ? (
        <View>
          <Text style={{ ...texts.x2l }}>{t('Confirme seu celular')}</Text>
          <Text style={{ ...texts.sm, color: colors.grey700, marginTop: padding }}>
            {t(
              `Enviamos um código SMS para o número +55 ${phoneFormatter(
                phone
              )}. Você deverá recebê-lo nos próximos segundos. Ao receber, informe o código abaixo:`
            )}
          </Text>
          <CodeInput
            style={{ marginTop: biggerPadding }}
            value={verificationCode}
            onChange={setVerificationCode}
            length={6}
          />
          {state === 'error' ? (
            <Text style={{ ...texts.sm, color: colors.red, marginTop: padding }}>{error}</Text>
          ) : null}
          <View style={{ flex: 1 }} />
          <DefaultButton
            style={{ marginVertical: doublePadding }}
            title={state !== 'error' ? t('Validar') : t('Tentar novamente')}
            onPress={verifyCodeHandler}
          />
        </View>
      ) : null}
      {state === 'unrecoverable-error' ? (
        <View>
          <Text style={{ ...texts.x2l }}>{t('Verificação falhou')}</Text>
          <Text style={{ ...texts.sm, color: colors.grey700, marginTop: padding }}>{error}</Text>
          <View style={{ flex: 1 }} />
          <DefaultButton
            style={{ marginVertical: doublePadding }}
            title={t('Voltar')}
            onPress={() => navigation.goBack()}
          />
        </View>
      ) : null}
    </PaddedView>
  );
};
