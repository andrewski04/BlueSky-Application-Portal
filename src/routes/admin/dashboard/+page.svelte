<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	let { data }: { data: PageData } = $props();

	let { user } = data;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<main class="bg-gray-100">
	<AdminNavBar message={`Welcome, ${user.firstName}!`} />

	<main class="p-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Calendar Widget -->
			<div class="rounded bg-white p-4 shadow">
				<div class="text-center">
					<h2 class="mb-2 text-lg font-semibold">January 2022</h2>
					<table class="w-full border-collapse">
						<thead>
							<tr>
								<th class="py-2">S</th>
								<th class="py-2">M</th>
								<th class="py-2">T</th>
								<th class="py-2">W</th>
								<th class="py-2">T</th>
								<th class="py-2">F</th>
								<th class="py-2">S</th>
							</tr>
						</thead>
						<tbody class="text-center">
							<tr>
								<td class="p-2 text-gray-400">26</td>
								<td class="p-2 text-gray-400">27</td>
								<td class="p-2 text-gray-400">28</td>
								<td class="p-2 text-gray-400">29</td>
								<td class="p-2 text-gray-400">30</td>
								<td class="p-2 text-gray-400">31</td>
								<td class="p-2">1</td>
							</tr>
							<tr>
								<td class="p-2">2</td>
								<td class="p-2">3</td>
								<td class="p-2">4</td>
								<td class="p-2">5</td>
								<td class="p-2">6</td>
								<td class="p-2">7</td>
								<td class="p-2">8</td>
							</tr>
							<tr>
								<td class="p-2">9</td>
								<td class="p-2">10</td>
								<td class="p-2">11</td>
								<td class="p-2">12</td>
								<td class="p-2">13</td>
								<td class="p-2">14</td>
								<td class="p-2">15</td>
							</tr>
							<tr>
								<td class="p-2">16</td>
								<td class="p-2">17</td>
								<td class="p-2">18</td>
								<td class="p-2">19</td>
								<td class="p-2">20</td>
								<td class="p-2">21</td>
								<td class="p-2">22</td>
							</tr>
							<tr>
								<td class="p-2">23</td>
								<td class="p-2">24</td>
								<td class="p-2">25</td>
								<td class="p-2">26</td>
								<td class="p-2">27</td>
								<td class="p-2">28</td>
								<td class="p-2">29</td>
							</tr>
							<tr>
								<td class="p-2">30</td>
								<td class="p-2">31</td>
								<td class="p-2 text-gray-400">1</td>
								<td class="p-2 text-gray-400">2</td>
								<td class="p-2 text-gray-400">3</td>
								<td class="p-2 text-gray-400">4</td>
								<td class="p-2 text-gray-400">5</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="absolute top-44 right-6 rounded border border-gray-300 bg-white shadow-lg">
					<div class="border-b border-gray-200 px-4 py-2 hover:bg-gray-100">Create event</div>
					<div class="border-b border-gray-200 px-4 py-2 hover:bg-gray-100">Go to today</div>
					<div class="border-b border-gray-200 px-4 py-2 hover:bg-gray-100">Day</div>
					<div class="border-b border-gray-200 px-4 py-2 hover:bg-gray-100">Week view</div>
					<div class="border-b border-gray-200 px-4 py-2 hover:bg-gray-100">Month view</div>
					<div class="px-4 py-2 hover:bg-gray-100">Year view</div>
				</div>
			</div>

			<!-- To Do List -->
			<div class="rounded bg-white p-4 shadow">
				<div class="border-b border-gray-200 pb-2"></div>
				<div class="mt-4">
					<div class="mb-2 flex items-center justify-between">
						<p class="font-medium">Review Applications</p>
						<div class="flex items-center">
							<span class="mr-2">Not Started</span>
							<span class="text-gray-400">▼</span>
						</div>
					</div>
					<textarea
						placeholder="Add comments"
						class="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none"
						rows="3"
					></textarea>
					<button
						class="mt-4 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
						>Add New Task</button
					>
				</div>
			</div>
		</div>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- Application Submission Tracker -->
			<div class="rounded bg-white p-4 shadow">
				<h3 class="mb-4 text-lg font-medium">Application Submission Tracker</h3>
				<div class="mb-4 flex text-sm font-medium">
					<span class="flex-1 underline">Submitted</span>
					<span class="flex-1">In Progress</span>
					<span class="flex-1 text-blue-500">View Data</span>
				</div>
				<div class="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
					<p>No data available for the selected criteria</p>
				</div>
				<div class="mt-4 border-t border-gray-200 pt-4">
					<h4 class="text-sm font-medium">Recent Applications</h4>
				</div>
			</div>

			<!-- Application Status Table -->
			<div class="rounded bg-white p-4 shadow">
				<table class="w-full border-collapse text-sm">
					<thead>
						<tr class="text-xs font-medium text-gray-500">
							<th class="py-2 text-left">STATUS</th>
							<th class="py-2 text-left">APPLICATION NAME/ID</th>
							<th class="py-2 text-center">TOTAL</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-gray-200">
							<td class="py-3 text-green-500">Accepted</td>
							<td class="py-3">Application 5 / Application ID</td>
							<td class="py-3 text-center">1</td>
						</tr>
						<tr class="border-b border-gray-200">
							<td class="py-3 text-yellow-500">Under Review</td>
							<td class="py-3">Application 6 / Application ID</td>
							<td class="py-3 text-center">2</td>
						</tr>
						<tr>
							<td class="py-3 text-blue-500">Status</td>
							<td class="py-3">Application 7 / Application ID</td>
							<td class="py-3 text-center">3</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Applications Table -->
			<div class="rounded bg-white p-4 shadow">
				<table class="w-full border-collapse text-sm">
					<thead>
						<tr class="text-xs font-medium text-gray-500">
							<th class="py-2 text-left">APPLICANT NAME</th>
							<th class="py-2 text-left">APPLICATION ID</th>
							<th class="py-2 text-left">DATE SUBMITTED</th>
							<th class="py-2 text-left">STATUS</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-gray-200">
							<td class="py-3">Applicant 5</td>
							<td class="py-3">ID-123</td>
							<td class="py-3">2022-01-05</td>
							<td class="py-3 text-green-500">Accepted</td>
						</tr>
						<tr class="border-b border-gray-200">
							<td class="py-3">Applicant 6</td>
							<td class="py-3">ID-456</td>
							<td class="py-3">2022-01-06</td>
							<td class="py-3 text-red-500">Not Accepted</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Application Review Table -->
		<div class="mt-4 rounded bg-white p-4 shadow">
			<table class="w-full border-collapse text-sm">
				<thead class="bg-blue-500 text-white">
					<tr>
						<th class="px-4 py-2 text-left">User</th>
						<th class="px-4 py-2 text-left">Application Status</th>
						<th class="px-4 py-2 text-left">Received</th>
						<th class="px-4 py-2 text-left">Interested</th>
						<th class="px-4 py-2 text-left">References Contacted</th>
						<th class="px-4 py-2 text-left">Accepted/Rejected</th>
						<th class="px-4 py-2 text-left">Emailed</th>
						<th class="px-4 py-2 text-left">Interview Date</th>
						<th class="px-4 py-2 text-left">Final Decision</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-gray-200">
						<td class="px-4 py-3">First name</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select status</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="px-4 py-3">First name</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select status</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">mm/dd/yyyy</td>
						<td class="px-4 py-3">
							<select class="rounded border px-2 py-1">
								<option>Select</option>
							</select>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</main>

	<div class="fixed right-0 bottom-0 m-4 rounded bg-gray-200 px-4 py-2 text-black shadow-lg">
		Chat
	</div>

	<a href="/auth/logout" class="btn btn-danger p-2 py-0">Logout</a>
</main>
