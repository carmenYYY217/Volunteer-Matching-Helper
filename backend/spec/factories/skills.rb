FactoryBot.define do
  factory :skill do
    name { Faker::Job.unique.key_skill }
  end
end
