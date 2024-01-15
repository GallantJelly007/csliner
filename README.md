
#  __Компактная Библиотека CSS in JS для быстрой верстки__ 

&nbsp;

+ [__Краткое описание__](#краткое-описание)
+ [__Конфигурация__](#конфигурация)
+ [__Классы и свойства__](#классы-и-свойства)


&nbsp;


## __Краткое описание__  
&nbsp;

__CSSJ__ - компактная библиотека содержащая в себе основные классы для создания отзывчивых и адаптируемых web-страниц. CSS классы генерируются по HTML разметке в зависимости от class аттрибута. Основные генерируемые классы описаны в разделе [Классы и свойства](#классы-и-свойства). Для установки и настройки пакета используются стандартные npm команды:

```
npm i cssj
npm explore cssj -- npm run init  
```

После выполнения указанных команд в папке проекта будет создан файл конфигурации с именем - ___cssj.config.json___. _(Подробнее про конфигурацию см. в [следующем разделе](#конфигурация))_

После того как HTML будет написан, либо в процессе его написания чтобы сгенерировать CSS классы и при необходимости объединить их с пользовательскими классами используется команда:

```
npm explore cssj -- npm run build
```
либо

```
npm explore cssj -- npm run build watch
```

Второй вариант позволяет отслеживать изменения в уже созданных файлах и делать ребилд собранного CSS файла.
&nbsp;

&nbsp;


## __Конфигурация__
&nbsp;

Стандартный файл конфигурации выглядит следующим образом

```json
{
	"BUILD_PATH": "{project-path/build}",
	"HTML_PATHES": [
		"{project-path}"
	],
	"CSS_PATHES": [],
	"IGNORE_PATHES": [],
	"SET_CLASSES": {},
	"MERGE_SAME_SELECTORS": false
}
```

#### __BUILD_PATH__ 

__Тип:__  ( _String_ )

Путь к папке(или файлу) билда, если указан каталог то файл по умолчанию будет иметь имя __app.css__
&nbsp;

---
#### __HTML_PATHES__ 

__Тип:__  ( _String[]_ ) 

Массив путей к папкам или HTML файлам проекта
&nbsp;

---
#### __CSS_PATHES__ 

__Тип:__  ( _String[] / object[]_ )
 
Массив путей к каталогам или CSS файлам, _(если необходимо их объединить с итоговым build файлом)._
Файлы CSS будут собраны в порядке следования путей, те что расположены в конце массива имеют более высокий приоритет. В случае если указан путь к каталогу, то файлы в каталоге будут собраны в порядке их обнаружения _( поэтому если необходима точная последовательность лучше указывать путь к фалам)_. Также приоритет может быть указан самостоятельно если вместо строкого пути использовать объект вида:

```json
{ 
    "path":"path", 
    "priority":10 
}
```
&nbsp;

---
#### __IGNORE_PATHES__ 

__Тип:__  ( _String[]_ ) 

Массив путей которые будут игнорироваться при сканировании html и сборке css файлов. Каталог ___node_modules___ всегда игнорируется по умолчанию.
&nbsp;

---
#### __SET_CLASSES__ 

__Тип:__  (_Object_) 

Объект содержащий в котором можно переопределить стандартные настройки CSS классов - название, единицы, приоритет, точность. _Например:_ Стандартный класс __m__ отвечает за свойство margin и измеряется в единицах rem, имеет точность 1. Чтобы поменять эти значения нужно добавить следующее свойство:

```json
{
	"SET_CLASSES": {
        "m":{
            "rename":"margin", //новое имя класса
            "unit": "px", //меняем единицы на px
            "precision": 0, //кол-во цифр после запятой = 0
            "priority":100 //более высокий приоритет
        }
    },
}
```

Раньше при использовании класса __m-15__ мы бы получили следующее:

```css
.m-15{
    margin:1.5rem
}
```

Теперь необходимо использовать класс __margin-15__:

```css
.margin-15{
    margin:15px;
}
```

Однако не все классы можно настраивать полностью _(более подробно о каждом классе см. Раздел [Классы и свойства](#классы-и-свойства))_
&nbsp;

---
#### __MERGE_SAME_SELECTORS__ 

__Тип:__  ( _Boolean_ ) 

Свойство указывающее, делать ли слияние одинаковых селекторов. Слияние в одном файле происходит согласно специфичности CSS _(чем ниже в файле расположен селектор тем он приоритетнее)._ Слияние из разных файлов происходит по их приоритету _(см. [CSS_PATHES](#css_pathes))_


&nbsp;

&nbsp; 

## __Классы и свойства__

Большинство классов имеют следующую структуру:

```
(префикс-)(класс)(-important)(_псевдокласс)-(значение)(ед.измерения)
```

&nbsp;

### __Префиксы__
---

#### __md-__ _(mobile device)_ префикс для медиа-запроса:

```css
@media(max-width:1023px) and (max-height:1023px)
```
_Пример:_
```html
<div class="md-fsz-15"></div>
```
_Результат в css:_
```css
@media(max-width:1023px) and (max-height:1023px){
    .md-fsz-15{
        font-size:1.5rem;
    }
}
```

---

#### __mdl-__ _(mobile device landscape)_ префикс для медиа-запроса:

```css
@media(max-width:1023px) and (max-height:1023px) and (orientation:landscape)
```
_Пример:_
```html
<div class="mdl-fsz-15"></div>
```
_Результат в css:_
```css
@media(max-width:1023px) and (max-height:1023px) and (orientation:landscape){
    .mdl-fsz-15{
        font-size:1.5rem;
    }
}
```

---

#### __mdp-__ _(mobile device portrait)_ префикс для медиа-запроса:

```css
@media(max-width:1023px) and (max-height:1023px) and (orientation:portrait)
```
_Пример:_
```html
<div class="mdp-fsz-15"></div>
```
_Результат в css:_
```css
@media(max-width:1023px) and (max-height:1023px) and (orientation:portrait){
    .mdp-fsz-15{
        font-size:1.5rem;
    }
}
```
&nbsp;
### __important__
---

Чтобы указать значения как important к классу добавляется постфикс __-i__

&nbsp;

### __Классы__

---

#### -------------------------------------- __d__ --------------------------------------
- __Свойство:__ display
- __Значение:__ flex | inflex _(inline-flex)_ | block | inblock _(inline-block)_ | grid | ingrid _(inline-grid)_ | table | rtable _(table-row)_ | inline | none | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 1
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.d-flex{
    display:flex;
}
```

---
#### -------------------------------------- __fxw__ --------------------------------------
- __Свойство:__ flex-wrap
- __Значение:__ wrap | nowrap 
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 2
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.fxw-wrap{
    flex-wrap:wrap;
}
```

---
#### -------------------------------------- __fd__ --------------------------------------
- __Свойство:__ flex-direction
- __Значение:__ row | rowrs _(row-reverse)_ | col _(column)_ | colrs _(column-reverse)_ | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 3
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.fd-rowrs{
    flex-direction: row-reverse;
}
```

---
#### -------------------------------------- __ai__ --------------------------------------
- __Свойство:__ align-items
- __Значение:__ start _(flex-start)_ | center | end _(flex-end)_ | stretch | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 4
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ai-start{
    align-items: flex-start;
}
```

---
#### -------------------------------------- __as__ --------------------------------------
- __Свойство:__ align-self
- __Значение:__ start _(flex-start)_ | center | end _(flex-end)_ | stretch | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 5
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.as-start{
    align-self: flex-start;
}
```

---
#### -------------------------------------- __jc__ --------------------------------------
- __Свойство:__ justify-content
- __Значение:__ start _(flex-start)_ | center | end _(flex-end)_ | stretch | bspace _(space-between)_ | aspace _(space-around)_ | espace _(space-evenly)_ | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 6
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.jc-bspace{
    justify-content: space-between;
}
```

---
#### -------------------------------------- __ajc__ --------------------------------------
- __Свойства:__ align-items, justify-content
- __Значение:__ start _(flex-start)_ | center | end _(flex-end)_ | stretch | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 7
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ajc-center{
    justify-content: center;
    align-items: center;
}
```

---
#### -------------------------------------- __basis__ --------------------------------------
- __Свойства:__ flex-basis
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 8
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit

_Пример:_
```css
.basis-50{
    flex-basis:50%;
}
```

---
#### -------------------------------------- __grow__ --------------------------------------
- __Свойства:__ flex-grow
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 9
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit

_Пример:_
```css
.grow-50{
    flex-grow:50%;
}
```

---
#### -------------------------------------- __shrink__ --------------------------------------
- __Свойства:__ flex-shrink
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 10
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit

_Пример:_
```css
.shrink-50{
    flex-shrink:50%;
}
```

---
#### -------------------------------------- __flex__ --------------------------------------
- __Свойства:__ flex
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ NULL
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 11
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit

_Пример:_
```css
.flex-1{
    flex:1;
}
```

---
#### -------------------------------------- __order__ --------------------------------------
- __Свойства:__ order
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ NULL
- __Точность:__ 0
- __Отрицательные значения:__ ДА
- __Приоритет__: 12
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.order-1{
    order:1;
}
```

---
#### -------------------------------------- __pos__ --------------------------------------
- __Свойство:__ position
- __Значение:__ static | absolute | relative | fixed | sticky | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 13
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.jc-bspace{
    justify-content: space-between;
}
```

---
#### -------------------------------------- __ov__ --------------------------------------
- __Свойство:__ overflow
- __Значение:__ visible | hidden | clip | scroll | auto | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 14
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ov-hidden{
    overflow: hidden;
}
```

---
#### -------------------------------------- __ovx__ --------------------------------------
- __Свойство:__ overflow-x
- __Значение:__ visible | hidden | clip | scroll | auto | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 15
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ovx-hidden{
    overflow-x: hidden;
}
```

---
#### -------------------------------------- __ovy__ --------------------------------------
- __Свойство:__ overflow-y
- __Значение:__ visible | hidden | clip | scroll | auto | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 16
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ovy-hidden{
    overflow-y: hidden;
}
```

---
#### -------------------------------------- __bst__ --------------------------------------
- __Свойство:__ border-top-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 17
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bst-solid{
    border-top-style: solid;
}
```

---
#### -------------------------------------- __bsr__ --------------------------------------
- __Свойство:__ border-right-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 18
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bsr-solid{
    border-right-style: solid;
}
```

---
#### -------------------------------------- __bsb__ --------------------------------------
- __Свойство:__ border-bottom-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 19
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bsb-solid{
    border-bottom-style: solid;
}
```

---
#### -------------------------------------- __bsl__ --------------------------------------
- __Свойство:__ border-left-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 20
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bsl-solid{
    border-left-style: solid;
}
```

---
#### -------------------------------------- __bsh__ --------------------------------------
- __Свойства:__ border-left-style, border-right-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 21
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bsh-solid{
    border-left-style: solid;
    border-right-style: solid;
}
```

---
#### -------------------------------------- __bsv__ --------------------------------------
- __Свойства:__ border-top-style, border-bottom-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 22
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bsv-solid{
    border-top-style: solid;
    border-bottom-style: solid;
}
```

---
#### -------------------------------------- __bs__ --------------------------------------
- __Свойства:__ border-style
- __Значение:__ solid | dotted | dashed | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 23
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bs-solid{
    border-style: solid;
}
```

---
#### -------------------------------------- __bwt__ --------------------------------------
- __Свойства:__ border-top-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 24
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.bwt-5{
    border-top-width:5px;
}
```

---
#### -------------------------------------- __bwr__ --------------------------------------
- __Свойства:__ border-right-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 25
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision 

_Пример:_
```css
.bwr-5{
    border-right-width:5px;
}
```

---
#### -------------------------------------- __bwb__ --------------------------------------
- __Свойства:__ border-bottom-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 26
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision 

_Пример:_
```css
.bwb-5{
    border-bottom-width:5px;
}
```

---
#### -------------------------------------- __bwl__ --------------------------------------
- __Свойства:__ border-left-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 27
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.bwl-5{
    border-left-width:5px;
}
```

---
#### -------------------------------------- __bwh__ --------------------------------------
- __Свойства:__ border-left-width, border-right-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 28
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.bwh-5{
    border-left-width:5px;
    border-right-width:5px;
}
```

---
#### -------------------------------------- __bwv__ --------------------------------------
- __Свойства:__ border-top-width, border-bottom-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 29
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.bwv-5{
    border-top-width:5px;
    border-bottom-width:5px;
}
```

---
#### -------------------------------------- __bw__ --------------------------------------
- __Свойства:__ border-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 30
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.bw-5{
    border-width:5px;
}
```

---
#### -------------------------------------- __bct__ --------------------------------------
- __Свойства:__ border-top-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 31
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bct-black{
    border-top-color: black;
}
```

---
#### -------------------------------------- __bcr__ --------------------------------------
- __Свойства:__ border-right-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 32
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bcr-black{
    border-right-color: black;
}
```

---
#### -------------------------------------- __bcb__ --------------------------------------
- __Свойства:__ border-bottom-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 33
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bcb-black{
    border-bottom-color: black;
}
```

---
#### -------------------------------------- __bcl__ --------------------------------------
- __Свойства:__ border-left-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 34
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bcl-black{
    border-left-color: black;
}
```

---
#### -------------------------------------- __bch__ --------------------------------------
- __Свойства:__ border-left-color, border-right-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 35
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bch-black{
    border-left-color: black;
    border-right-color: black;
}
```

---
#### -------------------------------------- __bcv__ --------------------------------------
- __Свойства:__ border-top-color, border-bottom-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 36
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bcv-black{
    border-top-color: black;
    border-bottom-color: black;
}
```

---
#### -------------------------------------- __bc__ --------------------------------------
- __Свойства:__ border-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 37
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bc-black{
    border-color: black;
}
```

---
#### -------------------------------------- __brad__ --------------------------------------
- __Свойства:__ border-radius
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ PX
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 38
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.brad-10{
    border-radius: 10px;
}
```

---
#### -------------------------------------- __h__ --------------------------------------
- __Свойства:__ height
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 39
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.h-100{
    height: 100%;
}
```

---
#### -------------------------------------- __minh__ --------------------------------------
- __Свойства:__ min-height
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 40
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.minh-100{
    min-height: 100%;
}
```

---
#### -------------------------------------- __maxh__ --------------------------------------
- __Свойства:__ max-height
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 41
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.maxh-100{
    max-height: 100%;
}
```

---
#### -------------------------------------- __w__ --------------------------------------
- __Свойства:__ width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 42
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.w-100{
    width: 100%;
}
```

---
#### -------------------------------------- __minw__ --------------------------------------
- __Свойства:__ min-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 43
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.minw-100{
    min-width: 100%;
}
```

---
#### -------------------------------------- __maxw__ --------------------------------------
- __Свойства:__ max-width
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ %
- __Точность:__ 0
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 44
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.maxw-100{
    max-width: 100%;
}
```

---
#### -------------------------------------- __op__ --------------------------------------
- __Свойства:__ opacity
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 45
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.maxw-100{
    max-width: 100%;
}
```

---
#### -------------------------------------- __ff__ --------------------------------------
- __Свойства:__ font-family
- __Значение:__ тескт-числа | inherit | initial
- __Единица измерения по умолчанию:__ NULL
- __Приоритет__: 46
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ff-Arial{
    font-family: Arial;
}
```

---
#### -------------------------------------- __fsz__ --------------------------------------
- __Свойства:__ font-size
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 47
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.fsz-15{
    font-size: 1.5rem;
}
```

---
#### -------------------------------------- __fw__ --------------------------------------
- __Свойства:__ font-weight
- __Значение:__ 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 48
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.fw-400{
    font-weigth: 400;
}
```

---
#### -------------------------------------- __ta__ --------------------------------------
- __Свойства:__ text-align
- __Значение:__ left | center | right | justify
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 49
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ta-center{
    text-align: center;
}
```

---
#### -------------------------------------- __tt__ --------------------------------------
- __Свойства:__ text-transform
- __Значение:__ upper _(uppercase)_ | lower _(lowercase)_ | cap _(capitalize)_ | none 
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 50
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.tt-upper{
    text-transform: uppercase;
}
```

---
#### -------------------------------------- __tdl__ --------------------------------------
- __Свойства:__ text-decoration-line
- __Значение:__ under _(underline)_ | over _(overline)_ | linet _(line-through)_ | none 
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 51
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.tdl-under{
    text-decoration-line: underline;
}
```

---
#### -------------------------------------- __tds__ --------------------------------------
- __Свойства:__ text-decoration-style
- __Значение:__ solid | double | dotted | dashed | wavy 
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 52
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.tds-double{
    text-decoration-style: double;
}
```

---
#### -------------------------------------- __ws__ --------------------------------------
- __Свойства:__ white-space
- __Значение:__ normal | pre | pwrap _(pre-wrap)_ | bspace _(break-spaces)_ | nowrap | inherit | initial 
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 53
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.ws-nowrap{
    white-space: nowrap;
}
```

---
#### -------------------------------------- __wb__ --------------------------------------
- __Свойства:__ word-break
- __Значение:__ normal | abreak _(break-all)_ | keep _(keep-all)_ |wbreak _(break-word)_ | inherit | initial 
- __Единица измерения по умолчанию:__ NULL 
- __Приоритет__: 54
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.wb-abreak{
    word-break: break-all;
}
```

---
#### -------------------------------------- __lh__ --------------------------------------
- __Свойства:__ line-height
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ NULL
- __Точность:__ 1
- __Отрицательные значения:__ НЕТ
- __Приоритет__: 55
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.lh-15{
    line-height: 1.5;
}
```

---
#### -------------------------------------- __m__ --------------------------------------
- __Свойства:__ margin
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 56
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.m-15{
    margin: 1.5rem;
}
```

---
#### -------------------------------------- __mh__ --------------------------------------
- __Свойства:__ margin-left, margin-right
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 57
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.mh-15{
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}
```

---
#### -------------------------------------- __mv__ --------------------------------------
- __Свойства:__ margin-top, margin-bottom
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 58
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.mv-15{
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
```

---
#### -------------------------------------- __mt__ --------------------------------------
- __Свойства:__ margin-top
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 59
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.mt-15{
    margin-top: 1.5rem;
}
```

---
#### -------------------------------------- __mr__ --------------------------------------
- __Свойства:__ margin-right
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 60
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.mr-15{
    margin-right: 1.5rem;
}
```

---
#### -------------------------------------- __mb__ --------------------------------------
- __Свойства:__ margin-bottom
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 61
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.mb-15{
    margin-bottom: 1.5rem;
}
```

---
#### -------------------------------------- __ml__ --------------------------------------
- __Свойства:__ margin-left
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 62
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.ml-15{
    margin-left: 1.5rem;
}
```

---
#### -------------------------------------- __p__ --------------------------------------
- __Свойства:__ padding
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 63
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.p-15{
    padding: 1.5rem;
}
```

---
#### -------------------------------------- __ph__ --------------------------------------
- __Свойства:__ padding-left, padding-right
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 64
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.ph-15{
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}
```

---
#### -------------------------------------- __pv__ --------------------------------------
- __Свойства:__ padding-top, padding-bottom
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 65
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.pv-15{
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
```

---
#### -------------------------------------- __pt__ --------------------------------------
- __Свойства:__ padding-top
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 66
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.pt-15{
    padding-top: 1.5rem;
}
```

---
#### -------------------------------------- __pr__ --------------------------------------
- __Свойства:__ padding-right
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 67
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.pr-15{
    padding-right: 1.5rem;
}
```

---
#### -------------------------------------- __pb__ --------------------------------------
- __Свойства:__ padding-bottom
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 68
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.pb-15{
    padding-bottom: 1.5rem;
}
```

---
#### -------------------------------------- __pl__ --------------------------------------
- __Свойства:__ padding-left
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 69
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.pl-15{
    padding-left: 1.5rem;
}
```

---
#### -------------------------------------- __t__ --------------------------------------
- __Свойства:__ top
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 70
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.t-30{
    top: 3.0rem;
}
```

---
#### -------------------------------------- __l__ --------------------------------------
- __Свойства:__ left
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 71
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.l-30{
    left: 3.0rem;
}
```

---
#### -------------------------------------- __b__ --------------------------------------
- __Свойства:__ bottom
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 72
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.b-30{
    bottom: 3.0rem;
}
```

---
#### -------------------------------------- __r__ --------------------------------------
- __Свойства:__ right
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ REM
- __Точность:__ 1
- __Отрицательные значения:__ ДА
- __Приоритет__: 73
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority, unit, precision

_Пример:_
```css
.r-30{
    right: 3.0rem;
}
```

---
#### -------------------------------------- __z__ --------------------------------------
- __Свойства:__ z-index
- __Значение:__ число | auto | inherit | initial | unset | none
- __Единица измерения по умолчанию:__ NULL
- __Отрицательные значения:__ ДА
- __Приоритет__: 74
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.z-10{
    z-index: 10;
}
```

---
#### -------------------------------------- __c__ --------------------------------------
- __Свойства:__ color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 75
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.c-white{
    color: white;
}
```

---
#### -------------------------------------- __bgc__ --------------------------------------
- __Свойства:__ background-color
- __Значение:__ цвет(hex|слово)
- __Единица измерения по умолчанию:__ COLOR
- __Приоритет__: 76
- __Настраиваемые свойства в SET_CLASSES:__ rename, priority

_Пример:_
```css
.bgc-white{
    background-color: white;
}
```






