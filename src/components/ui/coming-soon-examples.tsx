import React from "react";
import ComingSoon from "../ComingSoon";
import { Button } from "./button";
import { Input } from "./input";
import { Switch } from "./switch";

// This file shows examples of how to use the ComingSoon component
// You can delete this file after reviewing the examples

export const ComingSoonExamples = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Coming Soon Component Examples</h2>

      {/* Example 1: Wrapping a simple button */}
      <div>
        <h3 className="text-lg font-medium mb-2">Simple Button</h3>
        <ComingSoon>
          <Button>Advanced Analytics</Button>
        </ComingSoon>
      </div>

      {/* Example 2: Wrapping a form section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Form Section</h3>
        <ComingSoon>
          <div className="space-y-3 p-4 border rounded-lg">
            <label className="block text-sm font-medium">Premium Feature</label>
            <Input placeholder="Coming soon..." disabled />
            <Button disabled>Save</Button>
          </div>
        </ComingSoon>
      </div>

      {/* Example 3: Different variants */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Default</h4>
          <ComingSoon variant="default">
            <Button>Default</Button>
          </ComingSoon>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Subtle</h4>
          <ComingSoon variant="subtle">
            <Button>Subtle</Button>
          </ComingSoon>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Prominent</h4>
          <ComingSoon variant="prominent">
            <Button>Prominent</Button>
          </ComingSoon>
        </div>
      </div>

      {/* Example 4: Wrapping a toggle/switch */}
      <div>
        <h3 className="text-lg font-medium mb-2">Toggle Switch</h3>
        <ComingSoon>
          <div className="flex items-center space-x-3">
            <Switch disabled />
            <span className="text-sm">Beta Feature</span>
          </div>
        </ComingSoon>
      </div>

      {/* Example 5: Wrapping a card */}
      <div>
        <h3 className="text-lg font-medium mb-2">Card Component</h3>
        <ComingSoon>
          <div className="p-4 border rounded-lg bg-white">
            <h4 className="font-medium mb-2">Premium Dashboard</h4>
            <p className="text-sm text-gray-600 mb-3">
              Advanced insights and analytics coming soon...
            </p>
            <Button disabled>Learn More</Button>
          </div>
        </ComingSoon>
      </div>
    </div>
  );
};

// Usage examples in your components:
/*
// 1. Simple button
<ComingSoon>
  <Button>Advanced Feature</Button>
</ComingSoon>

// 2. Form section
<ComingSoon>
  <div className="space-y-3">
    <Input placeholder="Coming soon..." disabled />
    <Button disabled>Submit</Button>
  </div>
</ComingSoon>

// 3. With custom styling
<ComingSoon className="my-4" variant="prominent">
  <YourComponent />
</ComingSoon>

// 4. Wrapping multiple elements
<ComingSoon>
  <div>
    <h3>Feature Title</h3>
    <p>Description</p>
    <Button disabled>Action</Button>
  </div>
</ComingSoon>
*/
