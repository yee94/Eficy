import { render, initEficy, signal, isSignal, computed, effect } from 'eficy';

import * as shadcnUi from 'https://cdn.jsdelivr.net/npm/shadcdn/+esm';
import * as icons from 'https://cdn.jsdelivr.net/npm/lucide-react@0.536.0/+esm';
console.log('🚀 #### ~ shadcnUi:', shadcnUi, icons);

await initEficy({ components: { ...shadcnUi, ...icons } });

// 数据定义
const totalRevenue = signal("$15,231.89");
const subscriptions = signal("+2,350");
const moveGoal = signal(3);
const exerciseMinutes = signal([30, 45, 60, 35, 50]);

const teamMembers = signal([
  { name: "Sofia Davis", email: "m@example.com", role: "Owner", avatar: "SD" },
  { name: "Jackson Lee", email: "p@example.com", role: "Developer", avatar: "JL" },
]);

const payments = signal([
  { status: "Success", email: "ken99@example.com", selected: false },
  { status: "Success", email: "abe45@example.com", selected: false },
  { status: "Processing", email: "monserrat44@example.com", selected: false },
  { status: "Failed", email: "carmella@example.com", selected: false },
  { status: "Pending", email: "jason78@example.com", selected: false },
  { status: "Success", email: "sarah23@example.com", selected: false },
]);

const chatMessages = signal([
  { sender: "agent", message: "Hi, how can I help you today?" },
  { sender: "user", message: "Hey, I'm having trouble with my account." },
  { sender: "agent", message: "What seems to be the problem?" },
  { sender: "user", message: "I can't log in." },
]);

const formData = signal({
  name: "Evil Rabbit",
  email: "example@acme.cc",
  cardNumber: "1234 1234 1234 1",
  mm: "",
  yy: "",
  cvc: "",
  plan: "starter",
  notes: "",
  agreeTerms: false,
  allowEmails: true,
});

// 卡片组件
function MetricCard({ title, value, change, children }) {
  return (
    <e-Card>
      <e-CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <e-CardTitle className="text-sm font-medium">{title}</e-CardTitle>
        {children}
      </e-CardHeader>
      <e-CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </e-CardContent>
    </e-Card>
  );
}

// 总营收卡片
function TotalRevenueCard() {
  return (
    <MetricCard 
      title="Total Revenue" 
      value={totalRevenue} 
      change="+20.1% from last month"
    >
      <e-DollarSign className="h-4 w-4 text-muted-foreground" />
    </MetricCard>
  );
}

// 订阅卡片
function SubscriptionsCard() {
  return (
    <MetricCard 
      title="Subscriptions" 
      value={subscriptions} 
      change="+180.1% from last month"
    >
      <e-Users className="h-4 w-4 text-muted-foreground" />
    </MetricCard>
  );
}

// 目标卡片
function MoveGoalCard() {
  return (
    <e-Card>
      <e-CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <e-CardTitle className="text-sm font-medium">Move Goal</e-CardTitle>
        <e-Target className="h-4 w-4 text-muted-foreground" />
      </e-CardHeader>
      <e-CardContent>
        <div className="text-2xl font-bold">{moveGoal} CALC</div>
        <p className="text-xs text-muted-foreground">Set your daily activity goal</p>
        <e-Button variant="outline" size="sm" className="mt-2" onClick={() => moveGoal(moveGoal() + 1)}>
          <e-Plus className="h-4 w-4" />
        </e-Button>
      </e-CardContent>
    </e-Card>
  );
}

// 运动分钟卡片
function ExerciseMinutesCard() {
  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Exercise Minutes</e-CardTitle>
        <e-CardDescription>Your exercise minutes are ahead of where you normally are.</e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        <div className="h-[100px] flex items-center justify-center text-muted-foreground">
          <e-Activity className="h-8 w-8" />
        </div>
      </e-CardContent>
    </e-Card>
  );
}

// 团队成员卡片
function TeamMembersCard() {
  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Team Members</e-CardTitle>
        <e-CardDescription>Invite your team members to collaborate.</e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        {computed(() =>
          teamMembers().map((member) => (
            <div key={member.email} className="flex items-center space-x-4 py-2">
              <e-Avatar className="h-8 w-8">
                <e-AvatarFallback>{member.avatar}</e-AvatarFallback>
              </e-Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <e-Select defaultValue={member.role}>
                <e-SelectTrigger className="w-[100px]">
                  <e-SelectValue />
                </e-SelectTrigger>
                <e-SelectContent>
                  <e-SelectItem value="owner">Owner</e-SelectItem>
                  <e-SelectItem value="developer">Developer</e-SelectItem>
                  <e-SelectItem value="designer">Designer</e-SelectItem>
                </e-SelectContent>
              </e-Select>
            </div>
          ))
        )}
      </e-CardContent>
    </e-Card>
  );
}

// 支付表格
function PaymentsTable() {
  const selectedCount = computed(() => payments().filter(p => p.selected).length);
  
  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Payments</e-CardTitle>
        <e-CardDescription>Manage your payments.</e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        <e-Table>
          <e-TableHeader>
            <e-TableRow>
              <e-TableHead className="w-[50px]">
                <e-Checkbox />
              </e-TableHead>
              <e-TableHead>Status</e-TableHead>
              <e-TableHead>Email</e-TableHead>
            </e-TableRow>
          </e-TableHeader>
          <e-TableBody>
            {computed(() =>
              payments().map((payment, index) => (
                <e-TableRow key={index}>
                  <e-TableCell>
                    <e-Checkbox 
                      checked={payment.selected}
                      onCheckedChange={(checked) => {
                        const newPayments = [...payments()];
                        newPayments[index].selected = checked;
                        payments(newPayments);
                      }}
                    />
                  </e-TableCell>
                  <e-TableCell>
                    <e-Badge variant={payment.status === "Success" ? "default" : payment.status === "Failed" ? "destructive" : "secondary"}>
                      {payment.status}
                    </e-Badge>
                  </e-TableCell>
                  <e-TableCell>{payment.email}</e-TableCell>
                </e-TableRow>
              ))
            )}
          </e-TableBody>
        </e-Table>
        <div className="text-sm text-muted-foreground mt-2">
          {selectedCount} of {payments().length} row(s) selected.
        </div>
      </e-CardContent>
    </e-Card>
  );
}

// 聊天界面
function ChatInterface() {
  const newMessage = signal("");
  
  const sendMessage = () => {
    if (newMessage().trim()) {
      chatMessages([...chatMessages(), { sender: "user", message: newMessage() }]);
      newMessage("");
    }
  };

  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Support Chat</e-CardTitle>
        <e-CardDescription>Sofia Davis • m@example.com</e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        <div className="space-y-4 h-[200px] overflow-y-auto">
          {computed(() =>
            chatMessages().map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <e-Input 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => newMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <e-Button onClick={sendMessage}>
            <e-Send className="h-4 w-4" />
          </e-Button>
        </div>
      </e-CardContent>
    </e-Card>
  );
}

// 升级订阅表单
function UpgradeForm() {
  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Upgrade your subscription</e-CardTitle>
        <e-CardDescription>
          You are currently on the free plan. Upgrade to the pro plan to get access to all features.
        </e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        <e-Form>
          <div className="grid grid-cols-2 gap-4">
            <e-FormField>
              <e-FormLabel>Name</e-FormLabel>
              <e-Input value={formData().name} onChange={(e) => formData({...formData(), name: e.target.value})} />
            </e-FormField>
            <e-FormField>
              <e-FormLabel>Email</e-FormLabel>
              <e-Input value={formData().email} onChange={(e) => formData({...formData(), email: e.target.value})} />
            </e-FormField>
          </div>
          <e-FormField>
            <e-FormLabel>Card Number</e-FormLabel>
            <e-Input value={formData().cardNumber} onChange={(e) => formData({...formData(), cardNumber: e.target.value})} />
          </e-FormField>
          <div className="grid grid-cols-3 gap-4">
            <e-FormField>
              <e-FormLabel>MM</e-FormLabel>
              <e-Input placeholder="MM" value={formData().mm} onChange={(e) => formData({...formData(), mm: e.target.value})} />
            </e-FormField>
            <e-FormField>
              <e-FormLabel>YY</e-FormLabel>
              <e-Input placeholder="YY" value={formData().yy} onChange={(e) => formData({...formData(), yy: e.target.value})} />
            </e-FormField>
            <e-FormField>
              <e-FormLabel>CVC</e-FormLabel>
              <e-Input placeholder="CVC" value={formData().cvc} onChange={(e) => formData({...formData(), cvc: e.target.value})} />
            </e-FormField>
          </div>
          <e-FormField>
            <e-FormLabel>Plan</e-FormLabel>
            <e-RadioGroup value={formData().plan} onValueChange={(value) => formData({...formData(), plan: value})}>
              <div className="flex items-center space-x-2">
                <e-RadioGroupItem value="starter" id="starter" />
                <e-Label htmlFor="starter">Starter Plan</e-Label>
              </div>
              <div className="flex items-center space-x-2">
                <e-RadioGroupItem value="pro" id="pro" />
                <e-Label htmlFor="pro">Pro Plan</e-Label>
              </div>
            </e-RadioGroup>
          </e-FormField>
          <e-FormField>
            <e-FormLabel>Notes</e-FormLabel>
            <e-Textarea 
              placeholder="Enter notes" 
              value={formData().notes}
              onChange={(e) => formData({...formData(), notes: e.target.value})}
            />
          </e-FormField>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <e-Checkbox 
                id="terms" 
                checked={formData().agreeTerms}
                onCheckedChange={(checked) => formData({...formData(), agreeTerms: checked})}
              />
              <e-Label htmlFor="terms">I agree to the terms and conditions</e-Label>
            </div>
            <div className="flex items-center space-x-2">
              <e-Checkbox 
                id="emails" 
                checked={formData().allowEmails}
                onCheckedChange={(checked) => formData({...formData(), allowEmails: checked})}
              />
              <e-Label htmlFor="emails">Allow us to send you emails</e-Label>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <e-Button variant="outline">Cancel</e-Button>
            <e-Button>Upgrade Plan</e-Button>
          </div>
        </e-Form>
      </e-CardContent>
    </e-Card>
  );
}

// 创建账户表单
function CreateAccountForm() {
  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Create an account</e-CardTitle>
        <e-CardDescription>Enter your email below to create your account</e-CardDescription>
      </e-CardHeader>
      <e-CardContent>
        <div className="grid gap-4">
          <e-Button variant="outline" className="w-full">
            <e-Github className="mr-2 h-4 w-4" />
            GitHub
          </e-Button>
          <e-Button variant="outline" className="w-full">
            <e-Chrome className="mr-2 h-4 w-4" />
            Google
          </e-Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <e-FormField>
            <e-FormLabel>Email</e-FormLabel>
            <e-Input type="email" placeholder="m@example.com" />
          </e-FormField>
          <e-FormField>
            <e-FormLabel>Password</e-FormLabel>
            <e-Input type="password" />
          </e-FormField>
          <e-Button className="w-full">Create account</e-Button>
        </div>
      </e-CardContent>
    </e-Card>
  );
}

// 主仪表板
function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard.</p>
        </div>
        
        {/* 顶部指标卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TotalRevenueCard />
          <SubscriptionsCard />
          <MoveGoalCard />
          <ExerciseMinutesCard />
        </div>
        
        {/* 主要内容区域 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UpgradeForm />
          <CreateAccountForm />
          <TeamMembersCard />
          <PaymentsTable />
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

render(
  <Dashboard />,
  document.getElementById('app'),
);
