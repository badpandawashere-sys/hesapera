# Hesapera calculator scaffolder

```bash
npm run calculator:new
```

CLI yalnızca beş bilgi grubu ister:

1. Araç adı
2. Kategori
3. Inputlar
4. Formül atamaları
5. Outputlar

Input satırı formatı:

```text
amount / number / TL / required
distance / number / km / required / min=0.01 / max=1000000 / step=0.01
```

Formül satırı formatı:

```text
costPerKm = amount / distance
costPer100Km = costPerKm * 100
```

Output satırı formatı:

```text
costPerKm / TL/km
costPer100Km / TL/100km
```

Varsayılan çıktı `draft` ve `standard` UI kullanır. Premium scaffold için aynı beş girdiye ek olarak komut bayrağı kullanılabilir:

```bash
npm run calculator:new -- --premium
```

Dosyalara dokunmadan planı görmek için:

```bash
npm run calculator:new -- --dry-run
```

CI veya otomasyon girdileri `CalculatorScaffoldSpec` biçimindeki bir JSON dosyasından okunabilir:

```bash
npm run calculator:new -- --spec path/to/spec.json
```

Başarılı üretimden sonra ilgili test, TypeScript ve production build otomatik çalışır. Yalnızca kontrollü bakım senaryolarında `--skip-checks` kullanılabilir.
