import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkPassword } from "@/lib/trackerApi";

type ManagePasswordGateProps = {
  /** Shown on the card, so the gate says which page you are unlocking. */
  title: string;
  onUnlock: (password: string) => void;
};

/**
 * The lock screen in front of every manage page.
 *
 * One password covers the whole backend, so unlocking here unlocks all of them —
 * see src/lib/managePassword.ts. The password is verified against /api/auth
 * before it is stored, which keeps a typo from being saved and then failing on
 * every subsequent write instead of here.
 */
export const ManagePasswordGate = ({ title, onUnlock }: ManagePasswordGateProps) => {
  const [value, setValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      if (await checkPassword(value)) {
        onUnlock(value);
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="section-container flex justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={!value || isChecking}>
              {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePasswordGate;
