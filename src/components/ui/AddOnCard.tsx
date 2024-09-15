import { usePlanAddOn } from '@/context/use-plan-addon-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AddOnCard = ({ addOn }) => {
  return (
    <Card>
      <h3>{addOn.name}</h3>
      <p>{addOn.description}</p>
      <p>Price: ${addOn.price / 100} / month</p>
      <Button>Subscribe</Button>
    </Card>
  );
};

const AddOnList = () => {
  const { data } = usePlanAddOn();

  return (
    <div>
      <h2>Add-Ons</h2>
      <div className="add-on-list">
        {data.addOnData.map((addOn) => (
          <AddOnCard key={addOn.id} addOn={addOn} />
        ))}
      </div>
    </div>
  );
};

export default AddOnList;
