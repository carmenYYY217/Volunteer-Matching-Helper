FactoryBot.define do
  factory :volunteer do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    phone { Faker::PhoneNumber.cell_phone }
    status { 'active' }

    trait :with_skills_and_availability do
      after(:create) do |volunteer|
        volunteer.skills << create_list(:skill, 2)
        create_list(:availability, 2, volunteer: volunteer)
      end
    end
  end
end
