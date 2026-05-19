import TagCard from './tag-card';

const tagNameList = ['All', 'Computer Architecture', 'Frontend', 'Backend', 'AI', 'Data', 'Cloud Service', 'Git', 'Next.js']

export default function CardsDisplay() {
    
    return (
      <div className="grid pt-[6.5%] lg:pt-[5.5%] pb-[15%] md:grid-cols-2 md:pl-[20%] md:pr-[20%] lg:grid-cols-4 gap-10">
        {tagNameList.map((tagName) => {
          return (
            <div key={tagName} className="flex items-center justify-center">
              <TagCard
                tagName={tagName}
              />
            </div>
          );
        })}
      </div>
    );
}