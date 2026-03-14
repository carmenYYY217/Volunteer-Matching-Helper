FactoryBot.define do
  factory :role do
    title { Faker::Job.title }
    description { Faker::Lorem.paragraph }
    event_date { Faker::Date.forward(days: 30) }
    status { 'open' }

    trait :with_skills do
      after(:create) do |role|
        role.skills << create_list(:skill, 2)
      end
    end
  end
end
