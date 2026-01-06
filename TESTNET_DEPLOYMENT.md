# HALAL COIN - Testnet Deployment Guide

## ✅ Готовность проекта

Все компоненты готовы:
- ✅ Контракты скомпилированы
- ✅ Тесты пройдены (8/8)
- ✅ Скрипты деплоя настроены
- ✅ Metadata подготовлен

## 📋 Параметры токена

- **Название:** HALAL COIN
- **Символ:** HLLCN
- **Decimals:** 3
- **Total Supply:** 100,000,000 HLLCN (100,000,000,000 с decimals)
- **Admin:** `UQBhrm5E2njlRRCvJbOAuO0Sp-o7HHEsWaiSoDhI6CiDFZuO`
- **Deployer:** `UQDzmHXuxUSbXYpHLLC1_CeMjlezGI0hTWZSuuelx_vq882Z`
- **Mintable:** Да (с возможностью изменений)

## 🚀 Деплой на Testnet

### Шаг 1: Подготовка

1. Убедитесь что у deployer wallet есть testnet TON (минимум 1 TON)
   - Получить testnet TON: https://t.me/testgiver_ton_bot

2. Настройте TON wallet в Blueprint:
   ```powershell
   cd "c:\Users\kenih\OneDrive\Рабочий стол\HALAL-COIN\onchain\halal-coin-onchain"
   ```

### Шаг 2: Деплой Jetton Master контракта

Запустите скрипт деплоя:
```powershell
npx blueprint run deployJettonController --testnet
```

Скрипт:
- Задеплоит Jetton Master контракт
- Установит admin адрес
- Настроит metadata URI
- Выведет адрес контракта

**Сохраните адрес Jetton Master!**

### Шаг 3: Минтинг токенов

После успешного деплоя, заминтите 100M токенов:

```powershell
npx blueprint run mintTokens --testnet
```

Когда запросит Jetton Master адрес, введите адрес из Шага 2.

Скрипт:
- Отправит 100,000,000 HLLCN на admin адрес
- Создаст Jetton Wallet для admin
- Подтвердит транзакцию

### Шаг 4: Проверка

1. **Проверьте контракт на explorer:**
   ```
   https://testnet.tonviewer.com/<JETTON_MASTER_ADDRESS>
   ```

2. **Получите адрес вашего Jetton Wallet:**
   - Вызовите get-метод `get_wallet_address` с admin адресом
   - Или проверьте в транзакциях минтинга

3. **Проверьте баланс:**
   ```
   https://testnet.tonviewer.com/<YOUR_JETTON_WALLET_ADDRESS>
   ```

## 🔍 Тестирование на Testnet

### Проверка функций:

1. **Mint (дополнительный):**
   - Отправьте Mint message с admin wallet
   - Укажите получателя и количество

2. **Transfer:**
   - Откройте свой Jetton Wallet
   - Отправьте JettonTransfer на другой адрес
   - Проверьте баланс получателя

3. **Burn:**
   - Отправьте JettonBurn message
   - Проверьте что totalSupply уменьшился

4. **Change Owner:**
   - Отправьте ChangeOwner message
   - Проверьте что новый owner может минтить

## 🎯 После успешного тестирования

Когда убедитесь что всё работает на testnet:

### Mainnet Deployment

```powershell
# 1. Убедитесь что deployer wallet имеет ~2 TON на mainnet
# 2. Деплой на mainnet
npx blueprint run deployJettonController --mainnet

# 3. Минтинг на mainnet
npx blueprint run mintTokens --mainnet
```

### Обновите документацию:

1. Запишите адреса в [`deployment/mainnet.json`](../deployment/mainnet.json)
2. Добавьте transaction hashes
3. Обновите README с deployed адресами

## 🔑 Важные адреса

**Admin Wallet:**
```
UQBhrm5E2njlRRCvJbOAuO0Sp-o7HHEsWaiSoDhI6CiDFZuO
```

**Deployer Wallet:**
```
UQDzmHXuxUSbXYpHLLC1_CeMjlezGI0hTWZSuuelx_vq882Z
```

## 📝 Metadata

**Current metadata URL:**
```
https://raw.githubusercontent.com/NeoXonline-Development/HALAL-COIN/main/metadata/jetton.json
```

**Для добавления logo:**
1. Создайте изображение (PNG/SVG, 256x256px+)
2. Загрузите на IPFS или GitHub
3. Обновите `image` поле в jetton.json
4. Вызовите `JettonUpdateContent` message от admin

## ⚠️ Безопасность

- ✅ Храните seed phrases admin и deployer кошельков в безопасности
- ✅ Используйте hardware wallet для mainnet операций
- ✅ Проверяйте все транзакции перед подтверждением
- ✅ Тестируйте на testnet перед mainnet
- ✅ Не делитесь private keys

## 📞 Troubleshooting

**Ошибка "Insufficient funds":**
- Пополните deployer wallet на testnet

**Ошибка "Contract not deployed":**
- Подождите 10-15 секунд после деплоя
- Проверьте адрес контракта

**Ошибка "Only owner can mint":**
- Убедитесь что отправляете от admin адреса
- Проверьте что используете правильный wallet

## 🎊 Готово!

Проект полностью настроен и готов к деплою. Следуйте шагам выше для testnet деплоя.
