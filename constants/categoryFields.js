// categoryFields.js
export const categoryFields = {
    "Товары": [
      {
        label: "Состояние товара",
        options: [
          { label: "Новый", value: "Новый" },
          { label: "Б/У", value: "Б/У" }
        ],
        key: "condition"
      },
      {
        label: "Есть ли рассрочка?",
        options: [
          { label: "Нет", value: false },
          { label: "Да", value: true }
        ],
        key: "mortgage"
      },
      {
        label: "Есть ли доставка?",
        options: [
          { label: "Нет", value: false },
          { label: "Да", value: true }
        ],
        key: "delivery"
      }
    ],
  
    "Обучение ПБ": [
      {
        label: "Формат обучения",
        options: [
          { label: "Онлайн", value: "online" },
          { label: "Оффлайн", value: "offline" }
        ],
        key: "format"
      }
    ],
  
    "Пром. безопасность": [
      {
        label: "Вид услуги",
        options: [
          { label: "Аудит", value: "audit" },
          { label: "Проектирование", value: "design" }
        ],
        key: "serviceType"
      }
    ],
  
    "Охранные агентства": [
      {
        label: "Тип охраны",
        options: [
          { label: "Физическая", value: "physical" },
          { label: "Пультовая", value: "remote" }
        ],
        key: "securityType"
      },
      {
        label: "Объект охраны",
        options: [
          { label: "Офис", value: "office" },
          { label: "Склад", value: "warehouse" }
        ],
        key: "objectType"
      }
    ],
  
    "Найти сотрудника": [
      {
        label: "Тип занятости",
        options: [
          { label: "Полная", value: "full" },
          { label: "Частичная", value: "part" }
        ],
        key: "employmentType"
      },
      {
        label: "Опыт",
        options: [
          { label: "Без опыта", value: "no_exp" },
          { label: "С опытом", value: "has_exp" }
        ],
        key: "experience"
      }
    ],
  
    "Услуги": [
      {
        label: "Срочность",
        options: [
          { label: "Срочно", value: "urgent" },
          { label: "Планово", value: "planned" }
        ],
        key: "urgency"
      }
    ],
  
    "Прочее": [
      {
        label: "Тип объявления",
        options: [
          { label: "Вопрос", value: "question" },
          { label: "Предложение", value: "offer" }
        ],
        key: "adType"
      },
      {
        label: "Срочность",
        options: [
          { label: "Срочно", value: "urgent" },
          { label: "Не срочно", value: "not_urgent" }
        ],
        key: "urgency"
      }
    ]
  };
  